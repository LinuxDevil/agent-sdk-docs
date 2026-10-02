// Builds the pull request body for the "Sync SDK docs" workflow from the captured
// output of sync-sdk-docs.mjs and check-translations.mjs. Used by
// .github/workflows/sync-sdk-docs.yml; tested by sync-pr-body.test.mjs.
//
//   node scripts/sync-pr-body.mjs --sdk-sha <sha> --sync-out <file> --sync-exit <n> \
//        --trans-out <file> --changed <file> [--default-token] \
//        [--body-out <file>] [--title-out <file>] [--draft-out <file>]
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SDK_REPO = 'LinuxDevil/agent-sdk';

/** Lines of the sync output that are warnings rather than the "wrote N pages" summary. */
export function parseSyncWarnings(output) {
  const lines = output.split(/\r?\n/);
  const warnings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || /^wrote \d+ pages/.test(line) || /^\s/.test(line)) continue;
    let text = line;
    while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) text += `\n${lines[++i]}`;
    warnings.push(text);
  }
  return warnings;
}

/** Slugs reported stale (or never recorded) by check-translations.mjs. */
export function parseStale(output) {
  const stale = [];
  for (const line of output.split(/\r?\n/)) {
    const m = /^stale\s+([^\s:]+)/.exec(line);
    if (m) stale.push(m[1]);
  }
  return stale;
}

/** Other problems (code blocks differing, broken links) check-translations reported. */
export function parseProblems(output) {
  return output
    .split(/\r?\n/)
    .filter((l) => l.startsWith('problem'))
    .map((l) => l.replace(/^problem\s+/, ''));
}

export function buildPullRequest({ sdkSha, syncOutput, syncExitCode, translationsOutput, changedFiles, defaultToken = false }) {
  const shortSha = sdkSha.slice(0, 7);
  const warnings = parseSyncWarnings(syncOutput);
  const stale = parseStale(translationsOutput);
  const problems = parseProblems(translationsOutput);
  const draft = syncExitCode !== 0;
  const changed = changedFiles.filter(Boolean);

  const out = [];
  out.push(`Automated sync of the site with the SDK docs at [\`${shortSha}\`](https://github.com/${SDK_REPO}/commit/${sdkSha}) (\`${SDK_REPO}\` \`main\`).`);
  out.push('');
  out.push('## Pages changed');
  out.push('');
  out.push(changed.length ? changed.map((f) => `- \`${f}\``).join('\n') : 'None.');
  out.push('');
  out.push('## Sync warnings');
  out.push('');
  if (draft) out.push(`The sync exited with code ${syncExitCode}, so this pull request is a draft: do not merge until the items below are fixed.`, '');
  out.push(warnings.length ? warnings.map((w) => '```text\n' + w + '\n```').join('\n') : 'None.');
  out.push('');
  out.push('## Arabic pages');
  out.push('');
  if (stale.length) {
    out.push('These Arabic pages are stale (the English page changed since it was translated):', '');
    out.push(stale.map((s) => `- \`ar/${s.replace(/\.mdx$/, '')}.mdx\``).join('\n'));
  } else {
    out.push('No stale Arabic pages.');
  }
  if (problems.length) {
    out.push('', 'Other translation problems:', '', problems.map((p) => `- ${p}`).join('\n'));
  }
  out.push('');
  out.push('## Before merging');
  out.push('');
  out.push('- [ ] Stale pages: translate them (see `scripts/TRANSLATING.md`) and run `--fix-links` and `--record`, or add their slugs to `ar/pending.json` and run `node scripts/check-translations.mjs --mark-pending` (the checker skips pending pages).');
  out.push('- [ ] Add new pages to `PAGES` in `scripts/sync-sdk-docs.mjs` and to `docs.json` for both languages (`ar/<slug>` in the Arabic navigation, with the slug in `ar/pending.json`).');
  out.push('- [ ] Merging is manual: a merge to `main` deploys lousho.com.');
  if (defaultToken) {
    out.push('', '> This pull request was opened with the default `GITHUB_TOKEN`, so the `Check docs` workflow does not run on it: run the checks locally or trigger them by hand before merging.');
  }
  out.push('', 'Source: LinuxDevil/agent-sdk#192.');

  return { title: `Sync with SDK docs at ${shortSha}`, body: out.join('\n') + '\n', draft };
}

function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    args[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  const read = (f) => (f ? readFileSync(f, 'utf8') : '');
  const pr = buildPullRequest({
    sdkSha: String(args['sdk-sha'] ?? ''),
    syncOutput: read(args['sync-out']),
    syncExitCode: Number(args['sync-exit'] ?? 0),
    translationsOutput: read(args['trans-out']),
    changedFiles: read(args.changed).split(/\r?\n/),
    defaultToken: args['default-token'] === true,
  });
  if (args['body-out']) writeFileSync(args['body-out'], pr.body);
  else process.stdout.write(pr.body);
  if (args['title-out']) writeFileSync(args['title-out'], pr.title);
  if (args['draft-out']) writeFileSync(args['draft-out'], pr.draft ? 'true' : 'false');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
