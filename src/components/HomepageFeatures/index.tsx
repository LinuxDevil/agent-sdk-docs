import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Zero-config to full control',
    description: (
      <>
        <code>createAgent({'{'} prompt, provider {'}'})</code> in one line, or
        the full <code>AgentBuilder</code> + <code>AgentExecutor</code> API
        when you need checkpoints or tracing hooks.
      </>
    ),
  },
  {
    title: 'Human-in-the-loop',
    description: (
      <>
        Flag a tool <code>needsApproval</code> and pause execution until a
        human approves or rejects it, then <code>resumeAfterApproval()</code>{' '}
        from any process.
      </>
    ),
  },
  {
    title: 'Durable execution',
    description: (
      <>
        Pass a <code>sessionId</code> and <code>checkpointStore</code> — a
        crash mid-conversation resumes from the last checkpoint instead of
        restarting.
      </>
    ),
  },
  {
    title: 'Multi-agent delegation',
    description: (
      <>
        Wrap a child agent as a tool with <code>createDelegateTool()</code>,
        with a <code>maxDepth</code> guard against delegation loops.
      </>
    ),
  },
  {
    title: 'Pre/post hooks',
    description: (
      <>
        A <code>HookRegistry</code> of <code>AgentHook</code>s that inspect or
        mutate a tool call or LLM generate step, or throw to abort it.
      </>
    ),
  },
  {
    title: 'Guardrails',
    description: (
      <>
        Fail-closed, concurrently-run checks — secret scan, diff size,
        test/lint commands — that gate a fixer agent's patch before it's used.
      </>
    ),
  },
  {
    title: 'MCP client',
    description: (
      <>
        <code>loadMcpTools()</code> turns any Model Context Protocol server's
        tools into <code>ToolDescriptor</code>s your agent can call.
      </>
    ),
  },
  {
    title: 'Sandboxed tools',
    description: (
      <>
        Opt a tool into <code>requiresSandbox</code> to route it through a
        Docker-backed <code>SandboxAdapter</code> instead of running in-process.
      </>
    ),
  },
  {
    title: 'Any provider, any target',
    description: (
      <>
        OpenAI, Anthropic, Ollama, OpenRouter, or a mock provider for tests.
        <code>loushy build</code> ships to Node, Docker, or Cloudflare Workers.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
