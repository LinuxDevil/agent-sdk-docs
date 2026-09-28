---
sidebar_position: 100
title: Glossary
description: Definitions of key terms and concepts in Build AI Agent SDK
---

# Glossary

This page defines key terms used throughout the Build AI Agent SDK documentation.

## A

### Agent
A configured AI entity with a specific purpose, behavior, and capabilities. An agent combines an LLM with tools, prompts, and execution logic to accomplish tasks.

**Example**: A customer support agent configured with FAQs and ticket creation tools.

### Agent Config
The complete configuration object (`AgentConfig`) defining an agent's type, prompt, tools, flows, and metadata. Created using `AgentBuilder`.

### Agent Executor
The `AgentExecutor` class that orchestrates agent execution, managing message flow, tool calls, approval gates, checkpoints, and tracing. It is a **static** class - there is no `new AgentExecutor()`; call `AgentExecutor.execute(options)` directly.

### Agent Spec
A declarative description of an agent (`AgentSpec`) as a YAML or JSON file - `name`, `prompt`, `provider`, and `tools` - loaded with `loadSpec()` and turned into a live agent with `specToAgent()`. See [Declarative Specs](./concepts/declarative-specs).

### Agent Type
A predefined category of agent behavior (`AgentType` enum):
- `SmartAssistant`: General-purpose conversational agent with tool calling
- `SurveyAgent`: Specialized for conducting surveys
- `CommerceAgent`: Optimized for e-commerce interactions
- `Flow`: Workflow-based agent following structured flows

### Approval Gate
The pause point `AgentExecutor` inserts before calling a tool flagged `needsApproval`. The run persists an `ExecutionSnapshot` and resolves with `finishReason: 'awaiting-approval'`; a human decision later resumes it via `resumeAfterApproval()`. See [Human-in-the-Loop](./concepts/human-in-the-loop).

## B

### Builder Pattern
A creational design pattern used by `AgentBuilder` to construct complex agent configurations through method chaining.

**Example**: `.setName().setType().addTool().build()`

## C

### Checkpoint
A saved snapshot of an execution's state (`Checkpoint`), persisted to a `CheckpointStore` (e.g. `LocalStorageCheckpointStore`) after every tool result, keyed by `sessionId`. Lets a conversation resume after a crash or process restart instead of starting over. See [Human-in-the-Loop](./concepts/human-in-the-loop).

### Core Message
The `CoreMessage` type from Vercel AI SDK representing a single message in a conversation with role and content.

### Conversation Context
The history of messages and state maintained across agent executions, enabling continuity in multi-turn conversations.

## D

### Delegation
Wrapping a child `AgentConfig` as a tool (`createDelegateTool()`) so a parent agent can hand a sub-task to it; the child runs through `AgentExecutor.execute()` under the hood, bounded by a `maxDepth` guard against delegation loops. See [Delegation](./concepts/delegation).

## E

### Execution Event
An event (`ExecutionEvent`) emitted during agent execution, such as text generation, tool calls, or errors. Used for monitoring and debugging.

### Execution Options
The `ExecuteOptions` configuration object passed to `AgentExecutor.execute()` specifying input, provider, tools, and behavior.

### Execution Result
The `ExecutionResult` object returned after agent execution, containing generated text, tool calls, usage statistics, and metadata.

### Eval
An agent-behavior regression test defined with `defineEval()` and run under `vitest`, scored by a function such as `exactMatch`, `toolCallOrder`, `budget`, or `llmJudge()` against an `ExecutionResult`. See [Observability](./concepts/observability).

## F

### Flow
A structured multi-step workflow (`AgentFlow`) that orchestrates complex operations through sequences of agent interactions and tool executions.

### Flow Node
An individual step in a flow, which can be an LLM call, tool execution, conditional branch, or sub-flow.

### Framework Agnostic
Architecture principle ensuring the SDK works with any JavaScript framework (React, Vue, Express, etc.) without dependencies on specific frameworks.

## G

### Guardrail
A fail-closed, async check (`Guardrail`) over a proposed action (e.g. a diff), run concurrently with others via `runGuardrails()`. Built-in guardrails include `secretScanGuardrail`, `createDiffSizeGuardrail()`, and `createCommandGuardrail()`. See [Guardrails & Safety](./concepts/guardrails-and-safety).

## L

### LLM Provider
An implementation of the `LLMProvider` interface that adapts a specific LLM service (OpenAI, Anthropic, Ollama, OpenRouter, or the built-in mock) to the SDK's standard interface. `resolveProvider('provider/model')` builds one from environment credentials.

### Locale
The language and regional settings (e.g., 'en', 'es', 'fr') used for agent responses and tool interactions.

## M

### MCP (Model Context Protocol)
An external protocol for exposing tools to an LLM agent. `loadMcpTools()` turns any MCP server's tools into `ToolDescriptor`s the SDK's `ToolRegistry` can register, namespaced `<connection>__<tool>`.

### Memory Manager
Component managing conversation context, message history, and state persistence across executions.

### Message
A single communication unit in a conversation with a role (`system`, `user`, `assistant`, `tool`) and content.

### Model
The specific LLM variant used for generation (e.g., 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus').

## P

### Prompt
The system message or instructions that define an agent's behavior, personality, and capabilities.

**Example**: "You are a helpful customer support agent. Be professional and concise."

### Provider
See **LLM Provider**.

## R

### Repository
An interface for data persistence operations (saving agents, messages, tool results). Implementations include mock repositories and database adapters (Drizzle).

## S

### Sandbox
A `SandboxAdapter` a tool flagged `requiresSandbox` runs through instead of executing in-process. `NoopSandbox` (zero isolation, the default) and `SubprocessSandbox` (must be constructed with `new`) are the two built-in adapters. See [Guardrails & Safety](./concepts/guardrails-and-safety).

### Session
A unique identifier (`sessionId`) grouping related agent executions with a `checkpointStore`, enabling durable, resumable conversations.

### Span / Trace
A `Span` is one timed unit of work (`agent.run`, `llm.generate`, `tool.call`) in an `AgentExecutor.execute()` run; passing a `TraceExporter` as `exporter` makes `withSpan()` emit a 3-level span tree for observability. See [Observability](./concepts/observability).

## T

### Tool
A function that agents can invoke to interact with external systems, perform calculations, or fetch data. Defined by `ToolDescriptor` and registered in `ToolRegistry`.

**Example**: Weather API tool, database query tool, calculator.

### Tool Call
An invocation of a tool by an LLM during execution. Contains the tool name, arguments, and a unique identifier.

### Tool Configuration
The `ToolConfiguration` object specifying which tool to use and its options when adding tools to an agent.

### Tool Descriptor
The `ToolDescriptor` object containing a tool's display name and implementation, plus the optional safety fields `needsApproval`, `requiresSandbox`, and `sandboxExecute`.

### Tool Registry
The `ToolRegistry` class managing tool registration, retrieval, and lifecycle. `register(name, descriptor)` takes two positional arguments, not a single object.

### Type Safety
Compile-time verification using TypeScript types to prevent runtime errors from invalid configurations or API usage.

## U

### Usage
Token consumption statistics including prompt tokens, completion tokens, and total tokens used in an LLM request.

## W

### Workflow
See **Flow**.

## Common Acronyms

- **SDK**: Software Development Kit
- **LLM**: Large Language Model
- **API**: Application Programming Interface
- **AI**: Artificial Intelligence
- **JSON**: JavaScript Object Notation
- **HTTP**: Hypertext Transfer Protocol
- **UUID**: Universally Unique Identifier
- **DTO**: Data Transfer Object

## Related Topics

- [Core Concepts: Agents](./concepts/agents)
- [Core Concepts: Tools](./concepts/tools)
- [Human-in-the-Loop](./concepts/human-in-the-loop)
- [Delegation](./concepts/delegation)
- [Guardrails & Safety](./concepts/guardrails-and-safety)
- [Observability](./concepts/observability)
- [Declarative Specs](./concepts/declarative-specs)
- [API Reference](./api/overview)

---

**SDK Version**: 1.0.0-alpha.8

*Missing a term? [Request an addition](https://github.com/LinuxDevil/agent-sdk/issues/new)*
