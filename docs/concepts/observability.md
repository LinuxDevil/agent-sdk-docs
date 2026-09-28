---
sidebar_position: 6
---

# Observability

Two complementary tools cover production observability: **tracing**, for watching what a live run actually did, and **evals**, for catching a behavior regression before it ships.

## Tracing

Pass an `exporter` (a `TraceExporter`) to `AgentExecutor.execute()` and it wraps the run in a 3-level span tree: a top-level `agent.run` span, with a nested `llm.generate` span around each `provider.generate()` call and a nested `tool.call` span around each tool execution - both parented to `agent.run`.

```typescript
import { AgentExecutor, withSpan } from '@loushy/build-ai-agent';

const exporter = {
  onSpanStart: (span) => console.log('[start]', span.name, span.attributes),
  onSpanEnd: (span) => console.log('[end]', span.name, span.endTime! - span.startTime, 'ms'),
};

await AgentExecutor.execute({
  agent, input, provider, exporter,
  redactContent: true, // omit prompt/tool-arg/result bodies from span attributes
});
```

- Omitting `exporter` makes `withSpan()` a no-op - tracing has zero overhead when you don't need it.
- `redactContent: true` keeps token counts, finish reason, tool name, and error/latency in span attributes, but leaves out the `agent.run` prompt and `tool.call` args/result bodies - useful when spans get shipped somewhere you don't want raw content ending up.
- Ready-made exporters (console and real OpenTelemetry bridges) live in the SDK's [`examples/tracing`](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/tracing) directory - see the [Examples gallery](../examples/gallery).

### `TraceExporter` interface

```typescript
interface TraceExporter {
  onSpanStart?(span: Span): void;
  onSpanEnd?(span: Span): void;
}
```

Implement your own to ship spans to Datadog, an OpenTelemetry collector, or anywhere else.

### Lower-level hooks

For finer-grained observability than spans, `AgentExecutor.execute()` also accepts `onLLMRequest`/`onLLMResponse` (fired around each `provider.generate()` call, with latency) and `onToolCall`/`onToolResult` (fired around each tool execution, with latency; `onToolResult` runs from a `finally` block so it fires even when the tool throws).

## Evals

Evals are agent-behavior regression tests - not unit tests of your code, but assertions about what an agent actually *does* given a fixed input, run under your normal test runner (`vitest`).

```typescript title="support-agent.eval.ts"
import { defineEval, exactMatch, toolCallOrder } from '@loushy/build-ai-agent';

defineEval({
  name: 'looks up the order before replying',
  agent, provider, toolRegistry,
  input: 'Where is order #123?',
  score: toolCallOrder([{ tool: 'lookupOrder' }]),
  threshold: 1,
});
```

Run it the same way you run any other test:

```bash
npx vitest run support-agent.eval.ts
```

### Scorers

| Scorer                     | Checks                                                              |
| ---------------------------- | ---------------------------------------------------------------------- |
| `exactMatch(matcher)`       | The result's text matches a string, regex, or predicate.             |
| `toolCallOrder(expected)`   | The tools were called, in the given order.                           |
| `budget(limits)`            | Token/step usage stays within limits (`describeBudgetFailure()` explains a failure). |
| `llmJudge(config)`          | An LLM scores the result against a rubric - for behaviors too fuzzy for an exact scorer. |

Each scorer is a function from `ExecutionResult` to a number (typically `0`/`1`, or a graded score for `llmJudge`), compared against `defineEval()`'s `threshold`.

## Next Steps

- [Guardrails & Safety](./guardrails-and-safety) - the check that runs on an agent's *output*, alongside tracing on its *process*
- [Examples gallery](../examples/gallery) - the `tracing` example and the ops-pipeline demo
- [`api/overview`](../api/overview) - full export list for tracing and evals
