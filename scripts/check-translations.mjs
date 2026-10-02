#!/usr/bin/env node
// Checks the Arabic pages in ar/ against their English sources.
//
//   node scripts/check-translations.mjs               report problems (exit 1 if any)
//   node scripts/check-translations.mjs --fix-links   rewrite internal links in ar/ to /ar/...
//   node scripts/check-translations.mjs --record      store the English hashes the translations match
//   node scripts/check-translations.mjs --list-pending  print ar/pending.json (the pages waiting for translation)
//   node scripts/check-translations.mjs --mark-pending  give every pending page its Arabic notice (see below)
//
// A page is "stale" when its English source changed after --record was last run for it.
//
// ar/pending.json is a JSON array of slugs whose Arabic page is not up to date yet. Every check is
// skipped for such a slug and the run prints "pending  <slug>". A pending page carries the notice
// below (--mark-pending adds it: a banner above the old translation, or a stub page when there is
// no translation yet), so a reader is never shown wrong content without being told. Once a page is
// translated, remove its slug from pending.json AND delete the notice: the check fails for a
// page that is not pending but still has the marker.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { headings, mintSlug, slugList } from './anchors.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANG = 'ar';
const UNTRANSLATED = new Set(['changelog']);
const manifestPath = join(root, LANG, 'translations.json');
const mode = process.argv[2];
const pendingPath = join(root, LANG, 'pending.json');
const MARKER = '{/* pending-translation */}';

const read = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const hash = (text) => createHash('sha1').update(text).digest('hex').slice(0, 12);
const slugs = readdirSync(root)
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => name.slice(0, -4))
  .filter((slug) => !UNTRANSLATED.has(slug));
const manifest = existsSync(manifestPath) ? JSON.parse(read(manifestPath)) : {};
const pending = existsSync(pendingPath) ? JSON.parse(read(pendingPath)) : [];
if (!Array.isArray(pending) || pending.some((slug) => typeof slug !== 'string')) {
  console.error(`${LANG}/pending.json must be a JSON array of slugs`);
  process.exit(1);
}
const isPending = (slug) => pending.includes(slug);

if (mode === '--list-pending') {
  console.log(JSON.stringify(pending));
  process.exit(0);
}

function notice(slug, stub) {
  const body = stub
    ? `<Note>\nهذه الصفحة لم تُترجَم إلى العربية بعد. اقرأ [النسخة الإنجليزية](/${slug}).\n</Note>`
    : `<Warning>\nلم تُحدَّث ترجمة هذه الصفحة بعد، والنسخة الإنجليزية هي الأحدث والأصح، وقد يختلف المحتوى أدناه عنها. اقرأ [النسخة الإنجليزية](/${slug}).\n</Warning>`;
  return `${MARKER}\n${body}\n`;
}

if (mode === '--mark-pending') {
  let marked = 0;
  for (const slug of pending) {
    const english = join(root, `${slug}.mdx`);
    if (!existsSync(english)) {
      console.error(`pending slug without an English page: ${slug}`);
      process.exit(1);
    }
    const file = join(root, LANG, `${slug}.mdx`);
    if (!existsSync(file)) {
      const title = /^title: (".*")$/m.exec(read(english))?.[1] ?? JSON.stringify(slug);
      writeFileSync(file, `---\ntitle: ${title}\n---\n\n${notice(slug, true)}`);
      marked++;
    } else {
      const text = read(file);
      if (text.includes(MARKER)) continue;
      const end = text.indexOf('\n---\n', 4);
      if (!text.startsWith('---\n') || end < 0) {
        console.error(`${LANG}/${slug}.mdx has no front matter`);
        process.exit(1);
      }
      const head = end + 5;
      writeFileSync(file, `${text.slice(0, head)}\n${notice(slug, false)}\n${text.slice(head).replace(/^\n+/, '')}`);
      marked++;
    }
  }
  console.log(`marked ${marked} pending pages`);
  process.exit(0);
}

function codeBlocks(text) {
  const blocks = [];
  let current = null;
  let marker = '';
  for (const line of text.split('\n')) {
    const match = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
    if (current === null && match && !match[3].includes("`")) {
      current = [line.trim()];
      marker = match[2];
    } else if (current !== null && match && match[2].startsWith(marker) && match[3].trim() === '') {
      blocks.push(current.join('\n'));
      current = null;
    } else if (current !== null) {
      current.push(line);
    }
  }
  return blocks;
}

const anchorLink = new RegExp(`\\]\\((/${LANG}/([a-z0-9-]+))?#([^)\\s]+)\\)`, 'g');
/** The heading ids Mintlify renders for a page ('' = English, LANG = translated). */
function pageSlugs(slug, lang) {
  const file = join(root, lang, `${slug}.mdx`);
  return existsSync(file) ? slugList(headings(read(file)), mintSlug) : [];
}

if (mode === '--fix-links') {
  let changed = 0;
  const pattern = new RegExp(`(\\]\\(|href=")/(?!${LANG}/)(${slugs.map((s) => s.replace(/[-]/g, '\\-')).join('|')})(?=[)#"])`, 'g');
  for (const slug of slugs) {
    const file = join(root, LANG, `${slug}.mdx`);
    if (!existsSync(file) || isPending(slug)) continue;
    const before = read(file);
    const after = before
      .replace(pattern, `$1/${LANG}/$2`)
      // Heading anchors: the English id becomes the id of the heading at the same position.
      .replace(anchorLink, (whole, path, page, anchor) => {
        const target = page ?? slug;
        const index = pageSlugs(target, '').indexOf(anchor);
        const translatedSlugs = pageSlugs(target, LANG);
        if (index < 0 || index >= translatedSlugs.length) return whole;
        return `](${path ?? ''}#${translatedSlugs[index]})`;
      });
    if (after !== before) {
      writeFileSync(file, after);
      changed++;
    }
  }
  console.log(`rewrote links in ${changed} pages`);
  process.exit(0);
}

const problems = [];
const stale = [];
const pendingSeen = [];
for (const slug of pending) {
  if (!slugs.includes(slug)) problems.push(`${LANG}/pending.json lists "${slug}", which is not an English page`);
}
for (const slug of slugs) {
  if (isPending(slug)) {
    pendingSeen.push(slug);
    const file = join(root, LANG, `${slug}.mdx`);
    if (!existsSync(file) || !read(file).includes(MARKER)) {
      problems.push(`${slug}: pending, but ${LANG}/${slug}.mdx has no pending notice (run --mark-pending)`);
    }
    continue;
  }
  const file = join(root, LANG, `${slug}.mdx`);
  if (!existsSync(file)) {
    problems.push(`${slug}: no ${LANG}/${slug}.mdx (translate it, or add "${slug}" to ${LANG}/pending.json)`);
    continue;
  }
  const english = read(join(root, `${slug}.mdx`));
  const translated = read(file);
  if (translated.includes(MARKER)) problems.push(`${slug}: still has the pending notice; delete it`);

  if (!/^---\ntitle: ".+"\n/.test(translated)) problems.push(`${slug}: front matter must start with a quoted title`);
  if (!/[؀-ۿ]/.test(translated)) problems.push(`${slug}: contains no Arabic text`);

  const a = codeBlocks(english);
  const b = codeBlocks(translated);
  if (a.length !== b.length) {
    problems.push(`${slug}: ${b.length} code blocks, the English page has ${a.length}`);
  } else {
    // Mermaid labels are translated, so those blocks may differ.
    const index = a.findIndex((block, i) => block !== b[i] && !/^(`{3,}|~{3,})mermaid/.test(block));
    if (index >= 0) problems.push(`${slug}: code block ${index + 1} differs from the English page`);
  }

  const headingCount = (text) => text.split('\n').filter((line) => /^#{2,4} /.test(line)).length;
  if (headingCount(english) !== headingCount(translated)) {
    problems.push(`${slug}: ${headingCount(translated)} headings, the English page has ${headingCount(english)}`);
  }

  const unfixed = translated.match(new RegExp(`\\]\\(/(?!${LANG}/)(?!(${[...UNTRANSLATED].join('|')})[)#])[a-z]`, 'g'));
  if (unfixed) problems.push(`${slug}: ${unfixed.length} internal links not under /${LANG}/ (run --fix-links)`);

  for (const [, , page, anchor] of translated.matchAll(anchorLink)) {
    if (!pageSlugs(page ?? slug, LANG).includes(anchor)) {
      problems.push(`${slug}: link to a heading that does not exist: ${page ? `/${LANG}/${page}` : ''}#${anchor} (run --fix-links)`);
    }
  }

  if (mode === '--record') manifest[slug] = hash(english);
  else if (manifest[slug] && manifest[slug] !== hash(english)) stale.push(slug);
  else if (!manifest[slug]) stale.push(`${slug} (never recorded)`);
}

if (mode === '--record') {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([x], [y]) => x.localeCompare(y)));
  writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`recorded ${Object.keys(sorted).length} pages`);
}

for (const slug of pendingSeen) console.log(`pending  ${slug}`);
for (const problem of problems) console.log(`problem  ${problem}`);
for (const slug of stale) console.log(`stale    ${slug}: the English page changed since it was translated`);
console.log(`${slugs.length} pages, ${pendingSeen.length} pending, ${problems.length} problems, ${stale.length} stale`);
if (problems.length || (mode !== '--record' && stale.length)) process.exit(1);
