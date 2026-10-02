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

## Local preview

```bash
npm install
npm run dev        # http://localhost:3000
```

## Checks

```bash
npm run check      # broken links
npx mint validate  # strict build validation
```

Both run in CI on every pull request.

## Deployment

Mintlify deploys the `main` branch to [lousho.com](https://lousho.com) through its GitHub app; there is no build step in this repository. A merge to `main` is a deploy.
