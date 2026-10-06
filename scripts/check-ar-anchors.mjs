// Audit anchors in ar/*.mdx: every link pointing to /ar/<page>#<anchor>
// or an in-page #<anchor> must match a heading slug in the target file.
// Slugging: GitHub-style — lowercase, drop punctuation/symbols, spaces -> '-'.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AR = fileURLToPath(new URL('../ar/', import.meta.url));

const files = readdirSync(AR).filter((f) => f.endsWith('.mdx'));
const pages = new Map(); // page name -> Set of slugs

function slugify(text, used) {
  const explicit = text.match(/\{#([a-z0-9-]+)\}\s*$/);
  if (explicit) {
    used.add(explicit[1]);
    return explicit[1];
  }
  let s = text
    .trim()
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s+/g, '-');
  let slug = s;
  let i = 0;
  while (used.has(slug)) slug = `${s}-${++i}`;
  used.add(slug);
  return slug;
}

for (const f of files) {
  const content = readFileSync(join(AR, f), 'utf8');
  const used = new Set();
  for (const line of content.split('\n')) {
    const m = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (m) slugify(m[1], used);
  }
  pages.set(f, used);
}

const problems = [];
for (const f of files) {
  const content = readFileSync(join(AR, f), 'utf8');
  const linkRe = /\]\((\/ar\/[a-z0-9-]+)?#([^)\s]+)\)|\]\(\/ar\/([a-z0-9-]+)(#[^)\s]+)?\)/g;
  let m;
  while ((m = linkRe.exec(content))) {
    // cases: [](/ar/foo#anchor) | [](#anchor) | [](/ar/foo) | [](/ar/foo#anchor)
    const full = m[0];
    const targetMatch = full.match(/\]\(\/ar\/([a-z0-9-]+)(?:#([^)\s]+))?\)/);
    const selfMatch = full.match(/\]\(#([^)\s]+)\)/);
    if (targetMatch) {
      const target = targetMatch[1] + '.mdx';
      const anchor = targetMatch[2];
      if (!anchor) continue;
      if (!pages.has(target)) {
        problems.push(`${f}: -> /ar/${targetMatch[1]}#${anchor} (no such page)`);
      } else if (!pages.get(target).has(anchor)) {
        problems.push(`${f}: -> /ar/${targetMatch[1]}#${anchor} (anchor missing)`);
      }
    } else if (selfMatch) {
      const anchor = selfMatch[1];
      if (!pages.get(f).has(anchor)) {
        problems.push(`${f}: -> #${anchor} (in-page anchor missing)`);
      }
    }
  }
}

console.log(problems.length ? problems.join('\n') : 'all anchors resolve');
