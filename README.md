# Lousho docs

The documentation site for [`@lousho/build-ai-agent`](https://github.com/LinuxDevil/agent-sdk), built with [Mintlify](https://mintlify.com).

## Where the content comes from

Most pages are **generated** from the SDK repository's `docs/*.md` (and its `CHANGELOG.md`). Those files are the source of truth: their TypeScript snippets are type-checked and executed in the SDK's CI. Do not edit a generated page here; edit the SDK doc and sync.

```bash
npm run sync                      # reads ../agent-sdk
npm run sync -- /path/to/agent-sdk
```

The script (`scripts/sync-sdk-docs.mjs`) adds front matter, rewrites links between pages, points links to source files at GitHub, and escapes what MDX would otherwise read as JSX. It reports any SDK doc that has no page and any page missing from the navigation.

Three pages are written by hand and are never overwritten: `introduction.mdx`, `coding-agents.mdx` and `examples.mdx`. Navigation, colours and the logo are in `docs.json`.

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

Mintlify deploys the default branch through its GitHub app; there is no build step in this repository. The Mintlify project must be connected to this repository in the Mintlify dashboard (Settings, Git settings).
