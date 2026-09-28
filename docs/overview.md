---
sidebar_position: 1
title: What is Build AI Agent SDK?
description: Overview of the Build AI Agent SDK, its architecture, and why it exists
---

# What is Build AI Agent SDK?

Build AI Agent SDK (`@loushy/build-ai-agent`) is a framework-agnostic TypeScript library for building AI agents that run safely in production. It started as a small execution loop and has grown into a full agent platform: human-in-the-loop approval gates, durable checkpoint/resume, multi-agent delegation, guardrails, tracing, an evals harness, an MCP client, sandboxing, and a CLI that scaffolds, runs, and deploys an agent — all on top of the same `AgentConfig` your agent already has.

## Why Build AI Agent SDK?

Modern applications increasingly need AI capabilities, but integrating LLMs comes with significant challenges:

- **Complexity**: Managing conversations, tool execution, and state
- **Lock-in**: Provider-specific SDKs tie you to particular LLM services
- **Type Safety**: Dynamic tool calling and untyped configurations lead to runtime errors
- **Production Concerns**: pausing for a human before a sensitive action, surviving a crash mid-conversation, keeping a fixer agent's output safe before it touches anything real

Build AI Agent SDK addresses these by providing:

1. **Framework Agnostic**: Works with React, Vue, Svelte, Angular, Express, Next.js, or vanilla JavaScript
2. **Provider Agnostic**: Support for OpenAI, Anthropic, Ollama, OpenRouter, and a deterministic mock provider for tests/demos
3. **Type Safe**: Full TypeScript support with comprehensive type definitions
4. **Production Ready**: human-in-the-loop approval gates, durable checkpoints, guardrails, and tracing built in
5. **Modular**: Use only what you need — the zero-config `createAgent()` for the common case, or `AgentBuilder` + the static `AgentExecutor.execute()` for full control

## Architecture Overview

The SDK follows a layered architecture with clear separation of concerns:
Add image of chart
![architecture](https://linuxdevil.github.io/agent-sdk-docs/img/arch.png)

### Core Components

#### `createAgent()`
The zero-config entry point: a prompt and a provider in, a `{ send }` agent out. Thin wrapper over `AgentBuilder` + the static `AgentExecutor`.

```typescript
const agent = createAgent({
  prompt: 'You are a helpful customer support assistant.',
  provider: resolveProvider('openai/gpt-4o-mini'),
});

const result = await agent.send('Hello!');
```

#### AgentBuilder
The fluent API for constructing agent configurations. Handles validation and provides type-safe configuration.

```typescript
const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setName('Support Agent')
  .setPrompt('You are a helpful assistant')
  .build();
```

#### AgentExecutor
A **static** class — there is no `new AgentExecutor()`. `AgentExecutor.execute()` runs the LLM/tool-calling loop and resolves to an `ExecutionResult`; it also understands approval gates, checkpoints, delegation, and tracing when those options are passed in.

```typescript
const result = await AgentExecutor.execute({
  agent,
  input: 'Hello, world!',
  provider: llmProvider,
  toolRegistry: tools
});
```

#### ToolRegistry
Manages tool registration and execution. Tools extend agent capabilities by connecting to external systems, and can opt into approval gates or sandboxing.

```typescript
const registry = new ToolRegistry();
registry.register('weather', {
  displayName: 'Get Weather',
  tool: weatherTool
});
```

#### LLMProvider
Abstract interface for LLM providers. Enables provider-agnostic code that works with any supported LLM service. `resolveProvider('<provider>/<model>')` builds one from environment credentials.

```typescript
const provider = resolveProvider('openai/gpt-4o-mini'); // reads OPENAI_API_KEY
```

## Key Concepts

### Agents
An **agent** is a configured AI entity with a specific purpose, tools, and behavior — described either in code (`AgentBuilder`/`createAgent()`) or declaratively as an `AgentSpec` YAML/JSON file.

### Tools
**Tools** are functions that agents can call to interact with external systems, perform calculations, or fetch data. A tool can flag `needsApproval` (pause for a human before running) or `requiresSandbox` (run through a `SandboxAdapter` instead of in-process).

### Flows
**Flows** are structured multi-step workflows that orchestrate complex operations. They define sequences of agent interactions and tool executions.

### Providers
**Providers** are adapters for different LLM services (OpenAI, Anthropic, Ollama, OpenRouter, and a deterministic mock provider). They normalize API differences and provide a consistent interface.

### Human-in-the-loop
An `AgentExecutor.execute()` run pauses instead of calling a tool flagged `needsApproval`, persisting an `ExecutionSnapshot`. A human approves or rejects later — even from a different process — and `resumeAfterApproval()` continues the run.

### Delegation
`createDelegateTool()` wraps a child `AgentConfig` as a tool a parent agent can call, running the child through `AgentExecutor.execute()` under the hood, with a `maxDepth` guard against delegation loops.

### Guardrails
Fail-closed, concurrently-run checks (`runGuardrails()`) — secret scanning, diff size, test/lint commands — that gate a proposed action (e.g. a fixer agent's patch) before it's trusted.

### Tracing & evals
`withSpan()`/`TraceExporter` give you a 3-level span tree (`agent.run` → `llm.generate`/`tool.call`) for observability. `defineEval()` plus scorers like `exactMatch`, `toolCallOrder`, and `llmJudge()` let you run agent-behavior regression tests under `vitest`.

## When to Use Build AI Agent SDK

**Use Build AI Agent SDK when you need to:**

- Build conversational AI applications (chatbots, assistants)
- Create automated workflows that pause for human approval before a sensitive action
- Integrate LLM capabilities into existing applications
- Build multi-agent systems with delegation and tool calling
- Need provider flexibility (switch between OpenAI, Anthropic, Ollama, OpenRouter)
- Require durable execution, guardrails, and observability in production

**Consider alternatives when:**

- You only need simple prompt completion (use provider SDKs directly)
- You're building a simple prototype without tool calling
- Your use case is covered by high-level frameworks (Langchain, etc.)

## Version Compatibility

| SDK Version   | Node.js | TypeScript | Vercel AI SDK | Zod      |
| -------------- | ------- | ---------- | -------------- | -------- |
| 1.0.0-alpha.8 | ≥18.0   | ≥5.0       | ^4.3.19        | ^3.25.76 |

## Browser Support

The SDK is written for Node.js; some modules (`fs`-backed storage, sandboxing, the CLI) are Node-only. The Cloudflare Workers deploy target ships a browser-platform build of the agent-execution path (currently mock-provider only — see [Deployment](./guides/deployment)).

## Next Steps

<div className="next-steps">

- **[Installation](./installation)** - Set up the SDK in your project
- **[Quick Start](./quick-start)** - Build your first agent in a few minutes
- **[Core Concepts](./concepts/agents)** - Understand agents, tools, and human-in-the-loop
- **[API Reference](./api/overview)** - Complete API documentation

</div>

## License

MIT © Build AI Agent

---

**SDK Version**: 1.0.0-alpha.8
