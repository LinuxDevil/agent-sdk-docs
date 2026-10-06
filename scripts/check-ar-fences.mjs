// Compare code blocks between English and Arabic pages.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

function blocks(text) {
  const out = [];
  let cur = null;
  for (const line of text.split('\n')) {
    if (cur === null && /^```/.test(line)) {
      cur = line + '\n';
    } else if (cur !== null) {
      cur += line + '\n';
      if (/^```\s*$/.test(line)) {
        out.push(cur);
        cur = null;
      }
    }
  }
  return out;
}

const files = readdirSync(join(ROOT, 'ar')).filter((f) => f.endsWith('.mdx'));
for (const f of files) {
  if (!existsSync(join(ROOT, f))) continue;
  const en = blocks(readFileSync(join(ROOT, f), 'utf8'));
  const ar = blocks(readFileSync(join(ROOT, 'ar', f), 'utf8'));
  if (en.length !== ar.length) {
    console.log(`${f}: ${en.length} en vs ${ar.length} ar blocks`);
    continue;
  }
  en.forEach((e, i) => {
    if (e !== ar[i]) {
      const d = [...e].findIndex((c, j) => c !== [...(ar[i] || '')][j]);
      console.log(`${f} block ${i}: first diff @${d}`);
      console.log('  en: ' + JSON.stringify(e.slice(Math.max(0, d - 15), d + 35)));
      console.log('  ar: ' + JSON.stringify((ar[i] || '').slice(Math.max(0, d - 15), d + 35)));
    }
  });
}
console.log('done');
