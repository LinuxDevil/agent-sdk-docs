// Heading anchors. The SDK docs link to headings with GitHub's slugs; Mintlify builds its
// ids differently (it keeps "/" and "+", turns "." into "-", and does not collapse
// spaces), and Arabic pages have Arabic ids. These helpers translate between them.

/** The h2-h4 headings of an MDX page, in order, as plain text. */
export function headings(mdx) {
  const out = [];
  let fence = null;
  for (const line of mdx.split('\n')) {
    const match = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    // An opening fence's info string cannot contain a backtick (that is inline code).
    if (match && (fence || !match[2].includes('`'))) {
      if (!fence) fence = match[1];
      else if (match[1].startsWith(fence)) fence = null;
      continue;
    }
    if (fence) continue;
    const heading = /^#{2,4} (.+)$/.exec(line);
    if (heading) out.push(plainText(heading[1]));
  }
  return out;
}

function plainText(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .trim();
}

/** GitHub's heading slug: what links in the SDK's Markdown use. */
export function githubSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

/** Mintlify's heading id, from the ids its preview renders (checked against every page). */
export function mintSlug(text) {
  return text
    .toLowerCase()
    .replace(/\./g, '-')
    .replace(/[^\p{L}\p{N}\p{M}\s_/+،؟-]/gu, '')
    .replace(/\s/g, '-');
}

/** Slugs for a list of headings, with the "-1", "-2" suffixes both systems add to repeats. */
export function slugList(texts, slug) {
  const seen = new Map();
  return texts.map((text) => {
    const base = slug(text);
    const count = seen.get(base);
    seen.set(base, count === undefined ? 0 : count + 1);
    return count === undefined ? base : `${base}-${count + 1}`;
  });
}
