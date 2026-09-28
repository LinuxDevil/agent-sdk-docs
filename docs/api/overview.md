---
sidebar_position: 1
---

# API Overview

The package root (`@loushy/build-ai-agent`) exports everything below. For the complete, generated API reference (every export, signature and doc comment), the SDK repo builds a TypeDoc site with `npm run docs:build` (writes `docs/api/index.html`).

## Installation

```bash npm2yarn
npm install @loushy/build-ai-agent ai zod
```

## Building and running agents

| Export                        | Description                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `createAgent(config)`         | Zero-config `{ send(message) }` agent from a prompt + provider (+ tools).                        |
| `AgentBuilder`                | Fluent builder for an `AgentConfig` (`AgentBuilder.create().setName(...)...build()`).            |
| `AgentExecutor.execute(opts)` | Static executor: runs an agent (LLM + tool-calling loop) and resolves to an `ExecutionResult`.    |
| `AgentType`                   | Agent type enum (e.g. `AgentType.SmartAssistant`).                                                |
| `resumeAfterApproval()`       | Resume an execution paused for human approval.                                                    |
| `createDelegateTool()`        | Wrap a child agent as a tool for multi-agent delegation.                                          |

`AgentExecutor` is a **static** class - there is no `new AgentExecutor()`. See [`api/agent-executor`](./agent-executor) for the full `ExecuteOptions`/`ExecutionResult` reference and [`api/agent-builder`](./agent-builder) for every `AgentBuilder` method.

## Declarative specs

| Export               | Description                                              |
| ---------------------- | ------------------------------------------------------------ |
| `loadSpec(path)`     | Load and validate a `.yaml`/`.yml`/`.json` `AgentSpec` file. |
| `agentSpecSchema`    | The zod schema for `AgentSpec`.                          |
| `specToAgent(spec)`  | Turn an `AgentSpec` into a live `createAgent()` agent.   |

See [Declarative Specs](../concepts/declarative-specs).

## Providers

| Export                                                                        | Description                                                     |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `resolveProvider('p/model')`                                                  | Build a real provider from env-var credentials.                |
| `LLMProviderRegistry`                                                         | Registry of provider factories (`create`, `register`, `has`).  |
| `OpenAIProvider`, `AnthropicProvider`, `OllamaProvider`, `OpenRouterProvider` | Provider classes.                                               |
| `createMockProvider()`, `MockLLMProvider`                                    | Deterministic mock provider for tests and demos.                |

## Tools

| Export                                          | Description                                    |
| -------------------------------------------------- | --------------------------------------------------- |
| `ToolRegistry`                                  | Holds the tools an agent config refers to (`register(name, descriptor)`). |
| `httpTool`, `currentDateTool`, `dayNameTool`   | Built-in tools.                                |
| `loadMcpTools()`                                | Load a Model Context Protocol server's tools as `ToolDescriptor`s. |

See [Tools](../concepts/tools).

## Human-in-the-loop & delegation

| Export                                                       | Description                                              |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `resumeAfterApproval()`                                        | Resume a run paused for human approval.                  |
| `StorageServiceApprovalStore`                                 | Built-in `ApprovalStore` backed by `StorageService`.      |
| `LocalStorageCheckpointStore`                                  | Built-in `CheckpointStore` for durable execution.         |
| `createDelegateTool()`                                          | Wrap a child agent as a tool a parent agent can call.     |

See [Human-in-the-Loop](../concepts/human-in-the-loop) and [Delegation](../concepts/delegation).

## Guardrails & sandboxing

| Export                                                                                             | Description                                             |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `runGuardrails()`, `Guardrail`                                                                     | Run a set of fail-closed checks over a proposed action. |
| `secretScanGuardrail`, `createDiffSizeGuardrail()`, `createCommandGuardrail()`, `createTestRunGuardrail()`, `createLintGuardrail()` | Built-in and helper guardrails.        |
| `NoopSandbox`, `SubprocessSandbox`                                                                  | Sandboxing for tools that opt in via `requiresSandbox`. `SubprocessSandbox` must be `new`'d; `NoopSandbox` is a ready singleton. |

See [Guardrails & Safety](../concepts/guardrails-and-safety).

## Flows, evals and observability

| Export                                                | Description                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| `FlowBuilder`, `FlowExecutor.execute(flow, context, onEvent?)` | Multi-step workflow graphs; `FlowExecutor` is also a static API. |
| `defineEval()`, `exactMatch`, `toolCallOrder`, `budget`, `llmJudge()` | Agent evals run under `vitest`.                        |
| `withSpan()`, `TraceExporter`                          | Tracing for `AgentExecutor.execute()`.                          |

See [Observability](../concepts/observability).

## Security & utilities

| Export                                    | Description                                              |
| -------------------------------------------- | --------------------------------------------------------------- |
| `EncryptionUtils`, `sha256`               | Random-salt encryption / hashing.                        |
| `StorageService`                          | File storage. Constructor is `(databaseIdHash, schema, fs, path, rootPath?)`. |
| `renderTemplate`                          | Jinja2-like template rendering for prompts.               |
| `MemoryManager`                           | Conversation context management.                          |

## Deployment

| Export                                                          | Description                                                     |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `registerAdapter()`, `getAdapter()`, `listAdapters()`, `DeploymentAdapter` | The adapter registry behind `loushy build` (see [Deployment](../guides/deployment)). |

## CLI

The `loushy` command (`loushy dev`, `loushy build`) and `create-loushy-agent` are separate executables installed alongside the package - see the [CLI guide](../guides/cli).

## Next Steps

- [`api/agent-builder`](./agent-builder) - full `AgentBuilder` method reference
- [`api/agent-executor`](./agent-executor) - full `AgentExecutor.execute()` options and result shape
