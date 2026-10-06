// Final manual remap for anchors whose headings changed shape
// (count mismatch -> positional mapping unsafe). Slugs computed
// from the current rewritten headings.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AR = fileURLToPath(new URL('../ar/', import.meta.url));

// target page -> { oldSlug: newSlug }
const remap = {
  'providers.mdx': {
    'الإدخال-متعدد-الوسائط': 'إدخال-multimodal',
    'أي-نموذج-من-ai-sdk-fromaisdk': 'أي-model-من-ai-sdk-fromaisdk',
    'إعادة-المحاولة-والنماذج-الاحتياطية': 'retry-ونماذج-fallback',
  },
  'sub-agents.mdx': {
    'الموافقات-داخل-وكيل-فرعي': 'approvals-inside-a-sub-agent',
    'الوكلاء-الفرعيون-عن-بُعد': 'remote-sub-agents',
    'متابعة-مهمة': 'تكملة-مهمة',
    'وكلاء-فرعيون-أم-مهارات-أم-مسارات-عمل؟': 'sub-agent-ولا-skill-ولا-flow',
    'الخطّافات-داخل-الوكلاء-الفرعيين': 'hooks-داخل-sub-agents',
  },
  'executor-api.mdx': {
    'خيارات-agentexecutor-execute': 'خيارات-agentexecutorexecute',
  },
  'streaming.mdx': {
    'الانتقال-من-onevent-/-executionevent': 'الانتقال-من-onevent-executionevent',
    subagents: 'sub-agents',
  },
  'approvals.mdx': {
    'طرح-سؤال-على-المستخدم': 'سؤال-المستخدم',
  },
  'durable-execution.mdx': {
    'atleastonce-tools-خلّي-الـ-side-effects-idempotent':
      'at-least-once-tools-خلّي-الـ-side-effects-idempotent',
  },
  'permission-modes.mdx': {
    'الـ-subagents': 'الـ-sub-agents',
    'أي-الـ-tools-readonly': 'أي-الـ-tools-read-only',
  },
  'structured-output.mdx': {
    subagents: 'sub-agents',
  },
  'workspace-tools.mdx': {
    'allowlisted-egress-network--allow--with-a-broker':
      'allowlisted-egress-network-allow-with-a-broker',
  },
};

const files = readdirSync(AR).filter((f) => f.endsWith('.mdx'));
let fixed = 0;

for (const f of files) {
  let content = readFileSync(join(AR, f), 'utf8');
  const orig = content;
  content = content.replace(
    /\]\((\/ar\/([a-z0-9-]+))?(#[^)\s]+)\)/g,
    (full, prefix, page, anchor) => {
      const target = page ? page + '.mdx' : f;
      const slug = anchor.slice(1);
      const m = remap[target];
      if (m && m[slug]) {
        fixed++;
        return `](${prefix ?? ''}#${m[slug]})`;
      }
      return full;
    }
  );
  if (content !== orig) writeFileSync(join(AR, f), content);
}

console.log(`fixed ${fixed} links`);
