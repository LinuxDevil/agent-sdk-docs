import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPullRequest } from './sync-pr-body.mjs';

const SHA = '0123456789abcdef0123456789abcdef01234567';

test('clean sync with no stale pages', () => {
  const pr = buildPullRequest({
    sdkSha: SHA,
    syncOutput: 'wrote 31 pages from sdk\n',
    syncExitCode: 0,
    translationsOutput: '31 pages, 0 problems, 0 stale\n',
    changedFiles: ['tools.mdx', ''],
  });
  assert.equal(pr.title, 'Sync with SDK docs at 0123456');
  assert.equal(pr.draft, false);
  assert.match(pr.body, /commit\/0123456789abcdef0123456789abcdef01234567/);
  assert.match(pr.body, /- `tools\.mdx`/);
  assert.match(pr.body, /## Sync warnings\n\nNone\./);
  assert.match(pr.body, /No stale Arabic pages\./);
  assert.doesNotMatch(pr.body, /default `GITHUB_TOKEN`/);
});

test('sync with warnings (exit 1) makes a draft', () => {
  const pr = buildPullRequest({
    sdkSha: SHA,
    syncOutput:
      'wrote 31 pages from sdk\nSDK docs with no page (add them to PAGES): new-thing.md\npages missing from docs.json navigation: new-thing\nlinks to headings that do not exist:\n  tools.mdx -> #gone\n',
    syncExitCode: 1,
    translationsOutput: '',
    changedFiles: ['tools.mdx'],
    defaultToken: true,
  });
  assert.equal(pr.draft, true);
  assert.match(pr.body, /exited with code 1/);
  assert.match(pr.body, /new-thing\.md/);
  assert.match(pr.body, /pages missing from docs\.json navigation: new-thing/);
  assert.match(pr.body, /tools\.mdx -> #gone/);
  assert.doesNotMatch(pr.body, /wrote 31 pages/);
  assert.match(pr.body, /default `GITHUB_TOKEN`/);
});

test('stale Arabic pages are listed as ar/<slug>.mdx', () => {
  const pr = buildPullRequest({
    sdkSha: SHA,
    syncOutput: 'wrote 31 pages from sdk\n',
    syncExitCode: 0,
    translationsOutput:
      'stale    tools: the English page changed since it was translated\nstale    memory (never recorded): the English page changed since it was translated\n31 pages, 0 problems, 2 stale\n',
    changedFiles: ['tools.mdx', 'memory.mdx'],
  });
  assert.equal(pr.draft, false);
  assert.match(pr.body, /- `ar\/tools\.mdx`/);
  assert.match(pr.body, /- `ar\/memory\.mdx`/);
  assert.match(pr.body, /--record/);
});
