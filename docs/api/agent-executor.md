---
sidebar_position: 2
title: AgentExecutor
description: Complete API reference for the AgentExecutor class
---

# AgentExecutor

`AgentExecutor` orchestrates agent execution: message flow, tool calling, human-in-the-loop approval, durable checkpoints, delegation, and tracing. It's the runtime component that brings an `AgentConfig` (built with `AgentBuilder` or `createAgent()`) to life.

## Overview

`AgentExecutor` is a **static, instance-free class - there is no `new AgentExecutor()`.** You call `AgentExecutor.execute(options)` directly.

**Import**:
```typescript
import { AgentExecutor } from '@loushy/build-ai-agent';
// or
import { AgentExecutor } from '@loushy/build-ai-agent/execution';
```

**Basic usage**:
```typescript
const result = await AgentExecutor.execute({
  agent,
  input: 'Hello, world!',
  provider: llmProvider,
  toolRegistry: tools,
});
```

## `AgentExecutor.execute()`

Executes an agent with the given input and resolves to the complete result once the tool-calling loop finishes (or pauses for approval).

**Signature**:
```typescript
static async execute(options: ExecuteOptions): Promise<ExecutionResult>
```

Only `agent`, `input`, and `provider` are required - everything else is optional. `execute()` validates the required options up front and throws immediately if one is missing, rather than failing deep inside the loop with a generic error.

### `ExecuteOptions`

| Option                | Type                                            | Description                                                                                       |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `agent`                | `AgentConfig`                                    | **Required.** Usually built with `AgentBuilder`.                                                 |
| `input`                | `string \| Message[]`                            | **Required.** A user message string, or a full conversation to continue.                          |
| `provider`             | `LLMProvider`                                    | **Required.** The provider to generate with.                                                      |
| `toolRegistry`         | `ToolRegistry`                                   | Holds the `ToolDescriptor`s the agent's `tools` config refers to.                                 |
| `maxSteps`             | `number`                                         | Upper bound on LLM/tool-calling iterations. Default `10`.                                          |
| `temperature`          | `number`                                         | Overrides the provider's default temperature.                                                      |
| `maxTokens`            | `number`                                         | Overrides the provider's default max response tokens.                                              |
| `onEvent`              | `(event: ExecutionEvent) => void`               | Callback fired for each execution event (`start`, `tool-call`, `tool-result`, `finish`, `error`, ...). |
| `approvalStore`        | `ApprovalStore`                                  | Enables human-in-the-loop: pauses before a `needsApproval` tool call instead of running it. See [Human-in-the-Loop](../concepts/human-in-the-loop). |
| `sessionId`            | `string`                                         | Groups a run with `checkpointStore` for durable, resumable execution.                             |
| `checkpointStore`      | `CheckpointStore`                                | Persists a checkpoint after every tool result; rehydrates on the next call with the same `sessionId`. |
| `skipSystemPromptInjection` | `boolean`                                   | When `true`, `input` is treated as already including any system prompt it needs - used internally by `resume.ts` when reconstructing messages from a snapshot. |
| `initialSteps`         | `number`                                         | Starting value for the step counter, used by `resume.ts` when continuing a run that already took some steps. Defaults to `0`. |
| `onLLMRequest`         | `(request: GenerateOptions) => void \| Promise<void>` | Fired immediately before each `provider.generate()` call.                                    |
| `onLLMResponse`        | `(response: GenerateResult, latencyMs: number) => void \| Promise<void>` | Fired immediately after each `provider.generate()` call resolves.               |
| `onToolCall`           | `(toolCall: ToolCall) => void \| Promise<void>` | Fired immediately before each tool execution.                                                     |
| `onToolResult`         | `(toolCall, result, latencyMs, error?) => void \| Promise<void>` | Fired after each tool execution settles (from a `finally` block, so it runs even on error). |
| `exporter`             | `TraceExporter`                                  | Wraps the run in a 3-level span tree (`agent.run` → `llm.generate`/`tool.call`). See [Observability](../concepts/observability). |
| `redactContent`        | `boolean`                                        | When `true`, span attributes omit prompt/tool-arg/result bodies. Token counts, finish reason, tool name, and error/latency are never redacted. Default `false`. |
| `sandbox`              | `SandboxAdapter`                                 | Used for tools flagged `requiresSandbox`. Defaults to `NoopSandbox` (zero isolation) when omitted. See [Guardrails & Safety](../concepts/guardrails-and-safety). |

Errors thrown by `onLLMRequest`/`onLLMResponse`/`onToolCall`/`onToolResult` are **not** swallowed - they propagate out of `execute()` like any other error, since a hook that silently fails to observe would be worse than one that fails loudly.

### `ExecutionResult`

```typescript
interface ExecutionResult {
  text: string;                // Final response text
  messages: Message[];         // Complete message history
  toolCalls: ToolCall[];       // All tool calls made
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;        // Why generation stopped, or 'awaiting-approval'
  steps: number;                // Number of loop iterations
  approvalId?: string;          // Set when finishReason === 'awaiting-approval'
}
```

When a tool call requires approval, `execute()` resolves early with `finishReason: 'awaiting-approval'` and `approvalId` set instead of throwing or hanging - resume it with `resumeAfterApproval()` (see [Human-in-the-Loop](../concepts/human-in-the-loop)).

### Basic example

```typescript
import { AgentExecutor } from '@loushy/build-ai-agent';

const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'What is the weather in London?',
  provider: openAIProvider,
  toolRegistry: tools,
});

console.log('Response:', result.text);
console.log('Tokens used:', result.usage.totalTokens);
console.log('Tool calls:', result.toolCalls.length);
```

### With event monitoring

```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Search for TypeScript tutorials',
  provider: openAIProvider,
  toolRegistry: tools,
  onEvent: (event) => {
    switch (event.type) {
      case 'start':
        console.log('Execution started');
        break;
      case 'tool-call':
        console.log('Calling tool:', event.toolCall?.function.name);
        break;
      case 'tool-result':
        console.log('Tool result:', event.toolResult);
        break;
      case 'text-complete':
        console.log('Response:', event.text);
        break;
      case 'finish':
        console.log('Usage:', event.usage);
        break;
      case 'error':
        console.error('Error:', event.error);
        break;
    }
  },
});
```

### Multi-turn conversations

```typescript
// First turn
const result1 = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Hello, my name is Alice',
  provider: openAIProvider,
});

// Second turn - feed the prior messages back in
const result2 = await AgentExecutor.execute({
  agent: myAgent,
  input: [...result1.messages, { role: 'user', content: "What's my name?" }],
  provider: openAIProvider,
});

console.log(result2.text); // should reference "Alice"
```

### Human-in-the-loop, checkpoints, delegation, and tracing

These are all just additional `ExecuteOptions` fields - see the dedicated pages for full examples:

- [Human-in-the-Loop](../concepts/human-in-the-loop) - `approvalStore`, `resumeAfterApproval()`, `sessionId` + `checkpointStore`
- [Delegation](../concepts/delegation) - `createDelegateTool()` wraps a child agent, which itself runs through `AgentExecutor.execute()`
- [Guardrails & Safety](../concepts/guardrails-and-safety) - `sandbox`
- [Observability](../concepts/observability) - `exporter`, `redactContent`, `onLLMRequest`/`onLLMResponse`/`onToolCall`/`onToolResult`

## Types

### ExecutionEvent

```typescript
type ExecutionEventType =
  | 'start'
  | 'text-delta'
  | 'text-complete'
  | 'tool-call'
  | 'tool-result'
  | 'finish'
  | 'error';

interface ExecutionEvent {
  type: ExecutionEventType;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  textDelta?: string;
  text?: string;
  toolCall?: ToolCall;
  toolResult?: {
    toolCallId: string;
    toolName: string;
    result: any;
    error?: string;
  };
  finishReason?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  error?: Error;
}
```

### Message

```typescript
type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

interface Message {
  role: MessageRole;
  content: string;
  name?: string;          // Tool name (for tool messages)
  toolCallId?: string;    // Tool call ID (for tool messages)
  toolCalls?: ToolCall[]; // Tool calls (for assistant messages)
}
```

### ToolCall

```typescript
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string of arguments
  };
}
```

## Execution Behavior

### Message building

1. **System message**: if `agent.prompt` is set (and `skipSystemPromptInjection` isn't `true`), it's prepended as the first message.
2. **Input messages**: if `input` is a string, it's converted to a user message; if it's a `Message[]`, it's used as-is.
3. **Tool results**: appended to the message history as the tool-calling loop proceeds.

### Tool-calling loop

```
Start
  │
  ▼
Call LLM (llm.generate span, if tracing)
  │
  ▼
Tool calls in response? ──no──► Return
  │ yes
  ▼
For each tool call:
  needsApproval? ──yes──► pause, persist snapshot, return 'awaiting-approval'
  │ no
  requiresSandbox? ──yes──► sandboxExecute(args, sandbox)
  │ no
  tool.execute(args)     (tool.call span, if tracing)
  │
  ▼
steps < maxSteps? ──no──► stop, finishReason reflects the limit
  │ yes
  └─────────────► loop back to "Call LLM"
```

Tool errors are non-fatal by default - the error message is fed back to the LLM as the tool's result, which can respond appropriately or retry. The exception is `PropagatingToolError` (and its subclass `DelegationDepthExceededError`, thrown when a delegation chain exceeds `maxDepth` - see [Delegation](../concepts/delegation)), which propagates straight out of `execute()` as a rejected promise instead.

### Token usage accumulation

`result.usage` sums tokens across every LLM call made during the execution, including every tool-calling iteration.

## Configuration Options

### `maxSteps`

Limits tool-calling iterations. Default `10`. Increase for complex, multi-step tasks; decrease for simple queries to bound cost. Monitor `result.steps` to tune it.

### `temperature` / `maxTokens`

Override the provider's defaults per call:

```typescript
const creative = await AgentExecutor.execute({
  agent: myAgent, input: 'Write a poem', provider: openAIProvider, temperature: 0.9,
});

const factual = await AgentExecutor.execute({
  agent: myAgent, input: 'What is 2+2?', provider: openAIProvider, temperature: 0.1,
});
```

## Error Handling

```typescript
try {
  const result = await AgentExecutor.execute({
    agent: myAgent,
    input: 'Hello',
    provider: openAIProvider,
  });
} catch (error) {
  console.error('Execution failed:', error);
}
```

```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Use a tool that might fail',
  provider: openAIProvider,
  toolRegistry: tools,
  onEvent: (event) => {
    if (event.type === 'tool-result' && event.toolResult?.error) {
      console.error('Tool error (non-fatal, fed back to the LLM):', event.toolResult.error);
    }
  },
});
```

## Testing

```typescript
import { createMockProvider } from '@loushy/build-ai-agent';

const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Hello',
  provider: createMockProvider({ responses: ['Hi there!'] }),
});

expect(result.text).toBe('Hi there!');
```

```typescript
const events: ExecutionEvent[] = [];

await AgentExecutor.execute({
  agent: myAgent,
  input: 'Test input',
  provider: createMockProvider({ responses: ['ok'] }),
  onEvent: (event) => events.push(event),
});

expect(events).toContainEqual(expect.objectContaining({ type: 'start' }));
expect(events).toContainEqual(expect.objectContaining({ type: 'finish' }));
```

For behavior-level regression tests rather than one-off assertions, use `defineEval()` - see [Observability](../concepts/observability).

## See Also

- [AgentBuilder](./agent-builder) - building agent configurations
- [Human-in-the-Loop](../concepts/human-in-the-loop) - approvals and checkpoints
- [Delegation](../concepts/delegation) - multi-agent systems
- [Guardrails & Safety](../concepts/guardrails-and-safety) - sandboxing
- [Observability](../concepts/observability) - tracing and evals

---

**SDK Version**: 1.0.0-alpha.8

*Found an issue? [Report it](https://github.com/LinuxDevil/agent-sdk/issues/new)*
