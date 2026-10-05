#!/usr/bin/env node
// Generates the Mintlify pages of this site from the SDK repository's docs/*.md.
//
//   node scripts/sync-sdk-docs.mjs [path-to-agent-sdk]     (default: ../agent-sdk)
//
// The SDK's docs are the source of truth: their TypeScript snippets are type-checked
// and executed in the SDK's CI. This script only reshapes them for Mintlify (front
// matter, links, MDX escaping). Do not edit a generated page; edit the SDK doc and
// run the script again. Hand-written pages (see HAND_WRITTEN) are never touched.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubSlug, headings, mintSlug, slugList } from './anchors.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sdkRoot = resolve(process.argv[2] ?? join(siteRoot, '..', 'agent-sdk'));
const GITHUB = 'https://github.com/LinuxDevil/agent-sdk/blob/main/';

if (!existsSync(join(sdkRoot, 'docs', 'quick-start.md'))) {
  console.error(`No SDK docs found at ${sdkRoot}. Pass the path to an agent-sdk checkout.`);
  process.exit(1);
}

/** SDK file (relative to the SDK root) -> page slug on this site. */
const PAGES = {
  'docs/quick-start.md': 'quickstart',
  'docs/installation.md': 'installation',
  'docs/tools.md': 'tools',
  'docs/approvals.md': 'approvals',
  'docs/sessions.md': 'sessions',
  'docs/memory.md': 'memory',
  'docs/structured-output.md': 'structured-output',
  'docs/streaming.md': 'streaming',
  'docs/reasoning.md': 'reasoning',
  'docs/sub-agents.md': 'sub-agents',
  'docs/handoffs.md': 'handoffs',
  'docs/skills.md': 'skills',
  'docs/agent-directories.md': 'agent-directories',
  'docs/flows.md': 'flows',
  'docs/providers.md': 'providers',
  'docs/durable-execution.md': 'durable-execution',
  'docs/compaction.md': 'compaction',
  'docs/guardrails.md': 'guardrails',
  'docs/workspace-tools.md': 'workspace-tools',
  'docs/react.md': 'react',
  'docs/vue.md': 'vue',
  'docs/svelte.md': 'svelte',
  'docs/ai-sdk-ui.md': 'ai-sdk-ui',
  'docs/nextjs.md': 'nextjs',
  'docs/channels.md': 'channels',
  'docs/schedules.md': 'schedules',
  'docs/acp.md': 'acp',
  'docs/testing.md': 'testing',
  'docs/evals.md': 'evals',
  'docs/observability.md': 'observability',
  'docs/cli.md': 'cli',
  'docs/deployment.md': 'deployment',
  'docs/cloudflare-workers.md': 'cloudflare-workers',
  'docs/auth.md': 'auth',
  'docs/registry.md': 'registry',
  'docs/agent-forge.md': 'agent-forge',
  'docs/api-overview.md': 'api-overview',
  'docs/configuration.md': 'configuration',
  'docs/errors.md': 'errors',
  'docs/utilities.md': 'utilities',
  'docs/executor-api.md': 'executor-api',
  'docs/build-a-coding-agent.md': 'build-a-coding-agent',
  'docs/troubleshooting.md': 'troubleshooting',
  'docs/migrating-to-create-agent.md': 'migrating-to-create-agent',
  // 'mcp' is reserved by Mintlify's built-in MCP endpoint; the page lives at /mcp-integration.
  'docs/mcp.md': 'mcp-integration',
  'docs/hooks.md': 'hooks',
  'docs/triggers.md': 'triggers',
  'docs/hosted-tools.md': 'hosted-tools',
  'docs/tool-search.md': 'tool-search',
  'docs/code-mode.md': 'code-mode',
  'docs/oauth.md': 'oauth',
  'docs/permission-modes.md': 'permission-modes',
  'docs/runs.md': 'runs',
  'docs/models-and-cost.md': 'models-and-cost',
  'docs/stream-events.md': 'stream-events',
  'docs/queue-and-steer.md': 'queue-and-steer',
  'docs/openapi-tools.md': 'openapi-tools',
  'docs/upgrading.md': 'upgrading',
  'CHANGELOG.md': 'changelog',
};

/** Shorter sidebar labels where the SDK title is long. */
const SIDEBAR_TITLES = {
  quickstart: 'Quick start',
  'ai-sdk-ui': 'AI SDK UI (useChat)',
  nextjs: 'Next.js and Fetch frameworks',
  acp: 'Editors (ACP)',
  'api-overview': 'API overview',
  observability: 'Tracing',
  'executor-api': 'Executor API',
  'migrating-to-create-agent': 'Migrating to createAgent()',
  'build-a-coding-agent': 'Build a coding agent',
  'mcp-integration': 'MCP',
  runs: 'Runs and cancellation',
  'stream-events': 'Stream events',
  'queue-and-steer': 'Queued input and steering',
  'models-and-cost': 'Models and cost',
  upgrading: 'Upgrading to 1.0',
};

/** Pages written by hand in this repository. Listed so the report can flag SDK docs with no page. */
const HAND_WRITTEN = ['introduction', 'coding-agents', 'examples'];

/** SDK docs that are deliberately not on the site (internal planning and research notes). */
const SKIPPED = new Set(['docs/eslint-baseline-followup.md']);

// ---------------------------------------------------------------------------------------------

/** Splits markdown into fenced-code and prose segments. */
function segments(markdown) {
  const out = [];
  const lines = markdown.split('\n');
  let buffer = [];
  let fence = null; // { marker, indent }
  const flush = (kind) => {
    if (buffer.length) out.push({ kind, lines: buffer });
    buffer = [];
  };
  for (const line of lines) {
    const match = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
    if (!fence && match && !match[3].includes("`")) {
      flush('prose');
      fence = { marker: match[2] };
      buffer.push(line);
    } else if (fence && match && match[2].startsWith(fence.marker) && match[3].trim() === '') {
      buffer.push(line);
      flush('code');
      fence = null;
    } else {
      buffer.push(line);
    }
  }
  flush(fence ? 'code' : 'prose');
  return out;
}

/**
 * Applies `fn` to the parts of a prose block that are not inside an inline code span.
 * A span opens with a run of backticks and closes with a run of the same length, and
 * may wrap across lines.
 */
function outsideInlineCode(block, fn) {
  let out = '';
  let last = 0;
  for (const match of block.matchAll(/(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g)) {
    out += fn(block.slice(last, match.index)) + match[0];
    last = match.index + match[0].length;
  }
  return out + fn(block.slice(last));
}

function rewriteLink(target, fromFile) {
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  const [path, anchor] = target.split('#');
  const resolved = posix.normalize(posix.join(posix.dirname(fromFile), path));
  const slug = PAGES[resolved];
  if (slug) return `/${slug}${anchor ? `#${anchor}` : ''}`;
  return `${GITHUB}${resolved}${anchor ? `#${anchor}` : ''}`;
}

function convertProse(lines, fromFile) {
  let text = lines.join('\n').replace(/<!--[\s\S]*?-->\n?/g, '');
  return text
    .split(/(\n{2,})/)
    .map((block) =>
      outsideInlineCode(block, (part) =>
        part
          .replace(/\]\(([^)\s]+)\)/g, (_, target) => `](${rewriteLink(target, fromFile)})`)
          .replace(/<(https?:\/\/[^>\s]+)>/g, '[$1]($1)')
          .replace(/<(?=[A-Za-z/!])/g, '&lt;')
          .replace(/\{/g, '&#123;')
          .replace(/\}/g, '&#125;'),
      ),
    )
    .join('');
}

function convertCode(lines) {
  // "```ts no-run" is the SDK's snippet-verifier syntax; Mintlify would show "no-run" as a file name.
  const first = lines[0].replace(/^(\s*(?:`{3,}|~{3,}))\s*([\w-]+)?.*$/, (_, ticks, lang) => `${ticks}${lang ?? ''}`);
  return [first, ...lines.slice(1)].join('\n');
}

const plain = (s) =>
  s
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

function convert(file, slug) {
  const source = readFileSync(join(sdkRoot, file), 'utf8').replace(/\r\n/g, '\n');
  const lines = source.split('\n');

  const h1 = lines.findIndex((line) => /^# /.test(line));
  let title = h1 >= 0 ? plain(lines[h1].slice(2)) : slug;
  let body = (h1 >= 0 ? lines.slice(h1 + 1) : lines).join('\n').replace(/^\n+/, '');

  let description;
  if (slug === 'changelog') {
    title = 'Changelog';
    description = 'Every notable change to @lousho/build-ai-agent, newest first.';
    body = body.slice(body.indexOf('## '));
  } else {
    // A short, link-free opening paragraph becomes the page's subtitle.
    const end = body.indexOf('\n\n');
    const first = end > 0 ? body.slice(0, end) : '';
    if (first && !/^[#>|`\-*\d]/.test(first) && !first.includes('](') && plain(first).length <= 240) {
      description = plain(first);
      body = body.slice(end + 2);
    }
  }

  const converted = segments(body)
    .map((segment) => (segment.kind === 'code' ? convertCode(segment.lines) : convertProse(segment.lines, file)))
    .join('\n');

  const front = ['---', `title: ${JSON.stringify(title)}`];
  if (SIDEBAR_TITLES[slug]) front.push(`sidebarTitle: ${JSON.stringify(SIDEBAR_TITLES[slug])}`);
  if (description) front.push(`description: ${JSON.stringify(description)}`);
  front.push('---', '');
  const note = `{/* Generated from ${file} in LinuxDevil/agent-sdk by scripts/sync-sdk-docs.mjs. Do not edit here. */}\n\n`;
  return `${front.join('\n')}${note}${converted.trimEnd()}\n`;
}

let written = 0;
for (const [file, slug] of Object.entries(PAGES)) {
  if (!existsSync(join(sdkRoot, file))) {
    console.error(`missing in the SDK: ${file}`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(join(siteRoot, `${slug}.mdx`), convert(file, slug));
  written++;
}

// Links in the SDK docs use GitHub's heading slugs; rewrite them to the ids Mintlify renders.
const allSlugs = [...Object.values(PAGES), ...HAND_WRITTEN];
const anchorMaps = {};
for (const slug of allSlugs) {
  const file = join(siteRoot, `${slug}.mdx`);
  if (!existsSync(file)) continue;
  const texts = headings(readFileSync(file, 'utf8').replace(/\r\n/g, '\n'));
  const github = slugList(texts, githubSlug);
  const mint = slugList(texts, mintSlug);
  anchorMaps[slug] = { github: new Map(github.map((g, i) => [g, mint[i]])), mint: new Set(mint) };
}
const unresolved = [];
for (const slug of Object.values(PAGES)) {
  const file = join(siteRoot, `${slug}.mdx`);
  if (!existsSync(file)) continue;
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/\]\((\/([a-z0-9-]+))?#([^)\s]+)\)/g, (whole, path, page, anchor) => {
    const map = anchorMaps[page ?? slug];
    if (!map) return whole;
    const target = map.github.get(anchor) ?? (map.mint.has(anchor) ? anchor : undefined);
    if (!target) {
      unresolved.push(`${slug}: ${path ?? ''}#${anchor}`);
      return whole;
    }
    return `](${path ?? ''}#${target})`;
  });
  if (after !== before) writeFileSync(file, after);
}

const unmapped = readdirSync(join(sdkRoot, 'docs'))
  .filter((name) => name.endsWith('.md'))
  .map((name) => `docs/${name}`)
  .filter((file) => !PAGES[file] && !SKIPPED.has(file));
const nav = readFileSync(join(siteRoot, 'docs.json'), 'utf8');
const notInNav = [...Object.values(PAGES), ...HAND_WRITTEN].filter((slug) => !nav.includes(`"${slug}"`));

console.log(`wrote ${written} pages from ${sdkRoot}`);
if (unmapped.length) console.log(`SDK docs with no page (add them to PAGES): ${unmapped.join(', ')}`);
if (notInNav.length) console.log(`pages missing from docs.json navigation: ${notInNav.join(', ')}`);
if (unresolved.length) console.log(`links to headings that do not exist:\n  ${unresolved.join('\n  ')}`);
if (unmapped.length || notInNav.length) process.exitCode = 1;
