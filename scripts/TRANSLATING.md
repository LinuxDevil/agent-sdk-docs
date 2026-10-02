# Translating the docs into Arabic

Arabic pages live in `ar/<slug>.mdx`, one per English page `<slug>.mdx`, with the same file name. The English page is the source; the Arabic page is a full translation of it, not a summary.

## What to translate

- All prose: paragraphs, headings, list items, table cells, blockquotes, card titles and card bodies, Mermaid node labels.
- In the front matter: the values of `title`, `sidebarTitle` and `description`. Keep the keys in English and keep the values as valid YAML strings in double quotes.

## What must stay exactly as it is

- **Fenced code blocks**: copy every fenced block byte for byte, including comments inside the code, the language tag and the indentation. A script compares them with the English page and fails on any difference.
- **Inline code** (anything in backticks): identifiers, option names, file names, commands, error codes, package names.
- **Link targets**: translate the link text, keep the URL or path. Write internal links as they are in the English page (`/tools`, `/approvals#stores`); a script rewrites them to `/ar/...` afterwards. Keep `#anchors` unchanged.
- **MDX and HTML**: component names and attributes (`<Card title="..." icon="..." href="...">`, `<CardGroup cols={3}>`); translate only human-readable attribute values such as `title`. Keep entities such as `&lt;`, `&#123;` and `&#125;` exactly as written, and keep the `{/* Generated from ... */}` comment line.
- Product and protocol names: Lousho, Agent Forge, OpenAI, Anthropic, OpenRouter, Ollama, Slack, Discord, Zed, Cloudflare Workers, Docker, SQLite, OpenTelemetry, MCP, ACP, npm, Node.js, TypeScript, zod, React, Vue, Svelte, Next.js. Ticket ids such as `LOU-D49` stay as they are.
- Table structure: the same number of columns and rows; keep the `| --- |` separator rows.

## Style

- Modern Standard Arabic, written for professional developers: clear, direct and natural. Translate the meaning of each sentence; do not translate word for word, and do not add or drop information.
- Address the reader directly, as the English does.
- Use Western digits (0-9). Keep the punctuation Arabic (، ؛ ؟).
- On first use in a page, a technical term may be followed by the English in parentheses, for example `نقطة حفظ (checkpoint)`. After that, use the Arabic term alone.
- When an English word in backticks sits in the middle of an Arabic sentence, leave it in backticks and build the Arabic sentence around it.

## Glossary

Use these terms on every page so the site reads as one document.

| English | Arabic |
| ------- | ------ |
| agent | وكيل |
| sub-agent | وكيل فرعي |
| lead agent | الوكيل الرئيسي |
| tool | أداة |
| tool call | استدعاء أداة |
| run | تشغيل |
| step | خطوة |
| session | جلسة |
| turn | دورة |
| approval | موافقة |
| permission | صلاحية |
| streaming | البث |
| event | حدث |
| checkpoint | نقطة حفظ |
| resume | استئناف |
| durable execution | التنفيذ المتين |
| store | مخزن |
| memory | الذاكرة |
| skill | مهارة |
| instructions | التعليمات |
| prompt | الموجّه |
| model | النموذج |
| provider | المزوّد |
| structured output | المخرجات المنظَّمة |
| schema | مخطط |
| reasoning | الاستدلال |
| context window | نافذة السياق |
| compaction | ضغط السياق |
| guardrail | حاجز حماية |
| sandbox | بيئة معزولة |
| hook | خطّاف |
| workspace | مساحة العمل |
| flow | مسار عمل |
| channel | قناة |
| schedule | جدول زمني |
| trigger | مُشغِّل |
| deployment | النشر |
| registry | السجل |
| eval | تقييم |
| trajectory | مسار التنفيذ |
| cassette | شريط تسجيل |
| mock model | نموذج وهمي |
| tracing | التتبّع |
| span | مقطع تتبّع (span) |
| token | رمز (token) |
| usage | الاستهلاك |
| cost | التكلفة |
| budget | الميزانية |
| fallback | البديل الاحتياطي |
| retry | إعادة المحاولة |
| timeout | المهلة |
| peer dependency | اعتمادية نظيرة |
| spec | ملف المواصفات |
| agent directory | مجلد الوكيل |
| human in the loop | إشراك الإنسان |
| breaking change | تغيير كاسر |
| deprecated | مُهمَل |

## After translating

```bash
node scripts/check-translations.mjs --fix-links   # rewrite internal links to /ar/...
node scripts/check-translations.mjs               # code blocks, front matter, stale pages
node scripts/check-translations.mjs --record      # store the English hashes the translation matches
```

## Pending pages

`ar/pending.json` lists the slugs whose Arabic page is new or out of date. To translate one:

1. Translate (or update) `ar/<slug>.mdx` completely, following the rules above. Delete the `{/* pending-translation */}` marker and the `<Note>` or `<Warning>` block under it.
2. Remove `"<slug>"` from `ar/pending.json`.
3. Run `--fix-links`, then the check, then `--record`.

While a slug is pending the checker skips it, and the page shows a notice that the English page is newer (a stub page, with a link to the English page, if there is no translation yet). Once the slug is out of `pending.json` the checker enforces everything, and fails if the marker is still in the file. `--list-pending` prints the list.

`check-translations.mjs` reports a page as **stale** when its English source changed after the translation was recorded. The changelog is not translated. The daily sync pull request (`sync/sdk-docs`) lists the stale pages as `ar/<slug>.mdx`; translate them on that branch and run `--record` afterwards.
