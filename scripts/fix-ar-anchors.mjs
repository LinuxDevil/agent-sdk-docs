// Fix broken anchors in ar/*.mdx after heading renames.
// For each page: old headings come from `git show HEAD:ar/<page>`,
// new headings from the working tree. When heading counts match we
// zip them positionally to build old-slug -> new-slug, then rewrite
// every /ar/<page>#<old> and in-page #<old> link.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const AR = fileURLToPath(new URL('../ar/', import.meta.url));
const ROOT = fileURLToPath(new URL('../', import.meta.url));

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

function headings(content) {
  return content
    .split('\n')
    .map((l) => l.match(/^#{1,6}\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((m) => m[1]);
}

const files = readdirSync(AR).filter((f) => f.endsWith('.mdx'));
const maps = new Map(); // page -> Map(oldSlug -> newSlug) | null
const newSlugs = new Map();

for (const f of files) {
  const cur = readFileSync(join(AR, f), 'utf8');
  const newH = headings(cur);
  const usedNew = new Set();
  newH.forEach((h) => slugify(h, usedNew));
  newSlugs.set(f, usedNew);

  let oldH = [];
  try {
    oldH = headings(execSync(`git show HEAD:ar/${f}`, { cwd: ROOT, encoding: 'utf8' }));
  } catch {
    // new file, no old version
  }
  if (oldH.length === newH.length && oldH.length > 0) {
    const usedOld = new Set();
    const usedSeq = new Set();
    const newSlugList = newH.map((h) => slugify(h, usedSeq));
    const m = new Map();
    oldH.forEach((h, i) => m.set(slugify(h, usedOld), newSlugList[i]));
    maps.set(f, m);
  } else {
    maps.set(f, null); // positional mapping unsafe
  }
}

const unresolved = [];
let fixed = 0;

for (const f of files) {
  let content = readFileSync(join(AR, f), 'utf8');
  const orig = content;
  content = content.replace(
    /\]\((\/ar\/([a-z0-9-]+))?(#[^)\s]+)\)/g,
    (full, prefix, page, anchor) => {
      const target = page ? page + '.mdx' : f;
      const slug = anchor.slice(1);
      const slugs = newSlugs.get(target);
      if (!slugs) return full;
      if (slugs.has(slug)) return full; // already fine
      const m = maps.get(target);
      if (m && m.has(slug)) {
        fixed++;
        return `](${prefix ?? ''}#${m.get(slug)})`;
      }
      unresolved.push(`${f}: ${full} -> ${target}`);
      return full;
    }
  );
  if (content !== orig) writeFileSync(join(AR, f), content);
}

console.log(`fixed ${fixed} links`);
if (unresolved.length) console.log('UNRESOLVED:\n' + unresolved.join('\n'));
