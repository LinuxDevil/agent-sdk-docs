---
sidebar_position: 1
---

# Welcome to Build AI Agent SDK

**Build AI Agent SDK** (`@loushy/build-ai-agent`) is a framework-agnostic library for building AI agents that run safely in production. It provides a clean, type-safe API for creating agents with tools, flows, human-in-the-loop approval, durable execution, multi-agent delegation, guardrails, tracing, evals, and a CLI to scaffold, run, and deploy.

## Why Build AI Agent SDK?

Building AI agents shouldn't be complicated. Our SDK provides:

- 🎯 **Framework Agnostic** - Works with React, Vue, Svelte, Angular, Express, or vanilla JavaScript
- ⚡ **Zero-config to full control** - `createAgent({ prompt, provider })` in one line, or `AgentBuilder` + the static `AgentExecutor` when you need every option
- 🧑‍⚖️ **Human-in-the-loop** - flag a tool `needsApproval` and pause execution until a human approves or rejects it
- 💾 **Durable execution** - checkpoint and resume a run across a crash or restart
- 🤝 **Multi-agent delegation** - wrap a child agent as a tool with `createDelegateTool()`, guarded by `maxDepth`
- 🛡️ **Guardrails** - fail-closed checks (secret scan, diff size, test/lint commands) that gate a fixer agent's patch
- 📊 **Tracing & evals** - `withSpan()`/`TraceExporter` for observability, `defineEval()` for agent-behavior regression tests
- 🔌 **MCP client** - load any Model Context Protocol server's tools as `ToolDescriptor`s
- 📦 **Sandboxing** - opt a tool into running through a Docker-backed `SandboxAdapter`
- 🚀 **CLI** - `create-loushy-agent` scaffolds a project, `loushy dev` runs a local chat server, `loushy build` deploys to a Node server, Docker, or Cloudflare Workers
- 📝 **Declarative specs** - describe an agent as a YAML/JSON file instead of code
- 🧪 **Type-Safe** - full TypeScript support with comprehensive type definitions
- 🔒 **Secure** - built-in encryption, hashing, and an SSRF-hardened HTTP tool

## Quick Example

Here's a simple agent in just a few lines of code:

```typescript
import { createAgent, resolveProvider } from '@loushy/build-ai-agent';

const agent = createAgent({
  prompt: 'You are a helpful customer support assistant.',
  provider: resolveProvider('openai/gpt-4o-mini'), // reads OPENAI_API_KEY
});

const result = await agent.send('Hello! I need help.');
console.log(result.text);
```

No manually-constructed repositories, executor, or provider object required. Swap `resolveProvider(...)` for `createMockProvider(...)` to run without any API key at all.

## Perfect For

- 🤖 Building chatbots and virtual assistants
- 🔄 Creating automated workflows that pause for human approval before a sensitive action
- 🛠️ Integrating LLMs into existing applications
- 🎯 Ops pipelines that watch for errors and open guardrail-gated PRs to fix them
- 📊 Building data analysis agents
- 💼 Creating customer support systems

## Get Started

Ready to build your first AI agent? Follow our [Installation Guide](./installation) to get started, or jump straight to the [Quick Start](./quick-start) tutorial.


## License

MIT © [Build AI Agent](https://github.com/LinuxDevil/agent-sdk)

