# Lousho docs

The documentation site for [`@lousho/build-ai-agent`](https://github.com/LinuxDevil/agent-sdk), live at **[lousho.com](https://lousho.com)** in English and [Arabic](https://lousho.com/ar/introduction). Built with [Mintlify](https://mintlify.com).

## Where the content comes from

Most pages are **generated** from the SDK repository's `docs/*.md` (and its `CHANGELOG.md`). Those files are the source of truth: their TypeScript snippets are type-checked and executed in the SDK's CI. Do not edit a generated page here; edit the SDK doc and sync.

```bash
npm run sync                      # reads ../agent-sdk
npm run sync -- /path/to/agent-sdk
```

The script (`scripts/sync-sdk-docs.mjs`) adds front matter, rewrites links between pages, points links to source files at GitHub, and escapes what MDX would otherwise read as JSX. It reports any SDK doc that has no page and any page missing from the navigation.

The script also rewrites links to headings: the SDK docs use GitHub's heading slugs, and Mintlify renders different ids (`scripts/anchors.mjs`).

A scheduled workflow (`.github/workflows/sync-sdk-docs.yml`) does this for you: every day at 05:00 UTC, on a manual run (`workflow_dispatch`) and on a `sdk-docs-changed` repository dispatch, it checks out the SDK `main`, runs the sync and, when anything changed, opens or updates one pull request from the branch `sync/sdk-docs` (rebuilt from `main` on every run, never deleted). The pull request lists the changed pages, the sync's warnings and the stale Arabic pages, and is a draft when a page is unmapped or missing from the navigation. Merging is manual: a merge to `main` is a deploy. The workflow needs "Allow GitHub Actions to create and approve pull requests" enabled in the repository settings; the optional secret `DOCS_SYNC_TOKEN` makes `check.yml` run on that pull request.

Three pages are written by hand and are never overwritten: `introduction.mdx`, `coding-agents.mdx` and `examples.mdx`. Navigation, colours and the logo are in `docs.json`.

## Arabic

The site has an Arabic version under `ar/`, one file per English page with the same name (the changelog is not translated). `docs.json` lists both languages under `navigation.languages`, and `style.css` sets right-to-left direction for Arabic pages while keeping code left to right.

The rules for translators (what to translate, what must stay byte for byte, the glossary) are in `scripts/TRANSLATING.md`. After translating or after a sync:

```bash
node scripts/check-translations.mjs --fix-links   # internal links and heading anchors -> /ar/...
node scripts/check-translations.mjs               # code blocks, headings, links, stale pages
node scripts/check-translations.mjs --record      # mark the translations as matching the current English
```

The check fails when a code block differs from the English page, when a link points to a heading that does not exist, or when an English page changed after its translation was recorded (the page is reported as stale). It runs in CI.

### Pages waiting for translation

`ar/pending.json` is a JSON array of slugs whose Arabic page is not up to date: new pages, or pages whose English changed after a sync. For a pending slug the checker skips every check and prints `pending  <slug>`, so CI stays green while translators catch up. `node scripts/check-translations.mjs --list-pending` prints the array.

What a reader sees: the Arabic navigation always lists every page. A pending page that has an older translation keeps it, under an Arabic warning that the English page is newer and the content below may differ (with a link to the English page). A pending page with no translation yet is a stub: an Arabic note that the page is not translated, with a link to the English page. Both carry the marker `{/* pending-translation */}`; `node scripts/check-translations.mjs --mark-pending` adds the notice to every pending page that lacks it.

### Adding a page later

1. Add the SDK file to `PAGES` in `scripts/sync-sdk-docs.mjs` (and a `SIDEBAR_TITLES` entry if the title is long), then run `npm run sync`.
2. Add the slug to the English navigation in `docs.json` and `ar/<slug>` at the same place in the Arabic navigation.
3. Add the slug to `ar/pending.json` and run `node scripts/check-translations.mjs --mark-pending`.
4. Translate later: follow `scripts/TRANSLATING.md`; the translator removes the slug from `ar/pending.json`, deletes the notice and runs `--fix-links` and `--record`. From then on CI enforces the page.

After a sync that makes translated pages stale, add the slugs the checker reports as `stale` to `ar/pending.json` and run `--mark-pending` in the same pull request.

## Local preview

```bash
npm install
npm run dev        # http://localhost:3000
```

## Checks

```bash
npm run check      # broken links
npx mint validate  # strict build validation
npm test           # tests for the sync pull request body
```

Both run in CI on every pull request.

## Deployment

Mintlify deploys the `main` branch to [lousho.com](https://lousho.com) through its GitHub app; there is no build step in this repository. A merge to `main` is a deploy.
