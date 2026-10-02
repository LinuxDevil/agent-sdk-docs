#!/usr/bin/env node
// Checks the Arabic pages in ar/ against their English sources.
//
//   node scripts/check-translations.mjs               report problems (exit 1 if any)
//   node scripts/check-translations.mjs --fix-links   rewrite internal links in ar/ to /ar/...
//   node scripts/check-translations.mjs --record      store the English hashes the translations match
//
// A page is "stale" when its English source changed after --record was last run for it.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANG = 'ar';
const UNTRANSLATED = new Set(['changelog']);
const manifestPath = join(root, LANG, 'translations.json');
const mode = process.argv[2];

const read = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const hash = (text) => createHash('sha1').update(text).digest('hex').slice(0, 12);
const slugs = readdirSync(root)
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => name.slice(0, -4))
  .filter((slug) => !UNTRANSLATED.has(slug));
const manifest = existsSync(manifestPath) ? JSON.parse(read(manifestPath)) : {};

function codeBlocks(text) {
  const blocks = [];
  let current = null;
  let marker = '';
  for (const line of text.split('\n')) {
    const match = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
    if (current === null && match) {
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

if (mode === '--fix-links') {
  let changed = 0;
  const pattern = new RegExp(`(\\]\\(|href=")/(?!${LANG}/)(${slugs.map((s) => s.replace(/[-]/g, '\\-')).join('|')})(?=[)#"])`, 'g');
  for (const slug of slugs) {
    const file = join(root, LANG, `${slug}.mdx`);
    if (!existsSync(file)) continue;
    const before = read(file);
    const after = before.replace(pattern, `$1/${LANG}/$2`);
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
for (const slug of slugs) {
  const file = join(root, LANG, `${slug}.mdx`);
  if (!existsSync(file)) {
    problems.push(`${slug}: no ${LANG}/${slug}.mdx`);
    continue;
  }
  const english = read(join(root, `${slug}.mdx`));
  const translated = read(file);

  if (!/^---\ntitle: ".+"\n/.test(translated)) problems.push(`${slug}: front matter must start with a quoted title`);
  if (!/[؀-ۿ]/.test(translated)) problems.push(`${slug}: contains no Arabic text`);

  const a = codeBlocks(english);
  const b = codeBlocks(translated);
  if (a.length !== b.length) {
    problems.push(`${slug}: ${b.length} code blocks, the English page has ${a.length}`);
  } else {
    const index = a.findIndex((block, i) => block !== b[i]);
    if (index >= 0) problems.push(`${slug}: code block ${index + 1} differs from the English page`);
  }

  const headings = (text) => text.split('\n').filter((line) => /^#{2,4} /.test(line)).length;
  if (headings(english) !== headings(translated)) {
    problems.push(`${slug}: ${headings(translated)} headings, the English page has ${headings(english)}`);
  }

  const unfixed = translated.match(new RegExp(`\\]\\(/(?!${LANG}/)[a-z]`, 'g'));
  if (unfixed) problems.push(`${slug}: ${unfixed.length} internal links not under /${LANG}/ (run --fix-links)`);

  if (mode === '--record') manifest[slug] = hash(english);
  else if (manifest[slug] && manifest[slug] !== hash(english)) stale.push(slug);
  else if (!manifest[slug]) stale.push(`${slug} (never recorded)`);
}

if (mode === '--record') {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([x], [y]) => x.localeCompare(y)));
  writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`recorded ${Object.keys(sorted).length} pages`);
}

for (const problem of problems) console.log(`problem  ${problem}`);
for (const slug of stale) console.log(`stale    ${slug}: the English page changed since it was translated`);
console.log(`${slugs.length} pages, ${problems.length} problems, ${stale.length} stale`);
if (problems.length || (mode !== '--record' && stale.length)) process.exit(1);
