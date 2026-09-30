import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

const basicExample = `import { createAgent, resolveProvider } from '@loushy/build-ai-agent';

const agent = createAgent({
  prompt: 'You are a helpful customer support assistant.',
  provider: resolveProvider('openai/gpt-4o-mini'), // reads OPENAI_API_KEY
});

const result = await agent.send('Hello!');
console.log(result.text);`;

const approvalExample = `import { AgentExecutor, resumeAfterApproval, StorageServiceApprovalStore, ToolRegistry } from '@loushy/build-ai-agent';

const registry = new ToolRegistry();
registry.register('send_email', {
  displayName: 'Send email',
  tool: emailTool,
  needsApproval: (args) => args.to.includes('@external.com'), // pauses for a human
});

const paused = await AgentExecutor.execute({
  agent, input, provider, toolRegistry: registry,
  approvalStore: new StorageServiceApprovalStore(storage),
});
// paused.finishReason === 'awaiting-approval', paused.approvalId is set

// ...later, from any process, after a human approves...
const result = await resumeAfterApproval(
  { id: paused.approvalId!, approved: true },
  approvalStore, provider, registry,
);`;

const hookExample = `import { HookRegistry, type AgentHook } from '@loushy/build-ai-agent/hooks';

const redactPii: AgentHook = {
  name: 'redact-pii',
  async preToolCall(ctx) {
    // mutate ctx.args, or throw to abort the tool call before it runs
  },
};

const hooks = new HookRegistry();
hooks.register(redactPii);

await AgentExecutor.execute({ agent, input, provider, toolRegistry, hooks });`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">
          A composable, framework-agnostic SDK for building AI agents that run
          safely in production. Zero-config to full control, human-in-the-loop
          approvals, durable checkpoints, multi-agent delegation, and a visual
          dashboard — any provider, any deploy target, no lock-in.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Get started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://github.com/LinuxDevil/agent-sdk">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function CodeExamples() {
  return (
    <section className={styles.codeSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          From zero-config to full control
        </Heading>
        <p className={styles.sectionSubtitle}>
          Start with one function call. Layer in approval gates, hooks, and
          checkpoints only where you actually need them.
        </p>
        <Tabs groupId="progressive-example" queryString={false}>
          <TabItem value="basic" label="Basic agent" default>
            <CodeBlock language="typescript">{basicExample}</CodeBlock>
          </TabItem>
          <TabItem value="approval" label="Approval gate">
            <CodeBlock language="typescript">{approvalExample}</CodeBlock>
          </TabItem>
          <TabItem value="hooks" label="Pre/post hooks">
            <CodeBlock language="typescript">{hookExample}</CodeBlock>
          </TabItem>
        </Tabs>
      </div>
    </section>
  );
}

function Quickstart() {
  return (
    <section className={styles.quickstartSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Quickstart
        </Heading>
        <div className="row">
          <div className={clsx('col col--4', styles.quickstartStep)}>
            <div className={styles.quickstartNumber}>1</div>
            <Heading as="h3">Install</Heading>
            <CodeBlock language="bash">
              npm install @loushy/build-ai-agent ai zod
            </CodeBlock>
          </div>
          <div className={clsx('col col--4', styles.quickstartStep)}>
            <div className={styles.quickstartNumber}>2</div>
            <Heading as="h3">Configure</Heading>
            <CodeBlock language="yaml">{`# agent.yaml
name: support-bot
prompt: You are a friendly support agent.
provider:
  type: openai
  model: gpt-4o-mini
tools:
  - current-date
  - http`}</CodeBlock>
          </div>
          <div className={clsx('col col--4', styles.quickstartStep)}>
            <div className={styles.quickstartNumber}>3</div>
            <Heading as="h3">Run</Heading>
            <CodeBlock language="bash">
              npx loushy dev agent.yaml
            </CodeBlock>
            <p className={styles.quickstartNote}>
              Chat UI + hot reload. Or <code>loushy build --target=node-server</code> to
              ship it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className={styles.socialProof}>
      <div className="container">
        <p>
          Built and maintained in the open by{' '}
          <Link to="https://github.com/LinuxDevil">the Loushy team</Link> —
          MIT licensed, with a{' '}
          <Link to="https://github.com/LinuxDevil/agent-sdk/actions/workflows/ci.yml">
            green CI badge
          </Link>{' '}
          and runnable, verified docs snippets.
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className={styles.finalCta}>
      <div className="container">
        <Heading as="h2">Ready to build?</Heading>
        <p>Start building agents with a composable, type-safe SDK today.</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Read the docs
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://github.com/LinuxDevil/agent-sdk">
            Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A composable, framework-agnostic SDK for building AI agents that run safely in production.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <CodeExamples />
        <Quickstart />
        <SocialProof />
        <FinalCTA />
      </main>
    </Layout>
  );
}
