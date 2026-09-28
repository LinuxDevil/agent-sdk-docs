---
sidebar_position: 2
---

# Examples Gallery

Runnable example agents live in the SDK repository's [`examples/`](https://github.com/LinuxDevil/agent-sdk/tree/main/examples) directory. Each one is runnable directly (see its own README for exact instructions); most use `tsx` and the free mock provider by default, so nothing here needs an API key to try.

## Flagship: [ops-pipeline](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/ops-pipeline)

The proof-of-concept the whole SDK builds toward. An end-to-end pipeline:

1. A **Grafana/Datadog monitor** detects an error.
2. It triggers a **fixer agent**, delegated the task of proposing a fix.
3. The proposed fix is gated behind a real **human approval step** - a Slack message with a "Fix it" button, backed by the SDK's [approval-gate machinery](../concepts/human-in-the-loop).
4. Once approved, the fixer agent's patch is checked by [`runGuardrails()`](../concepts/guardrails-and-safety) - secret scanning, diff size, and a test run - before anything happens.
5. Only if every guardrail passes does a **GitHub PR** get opened.

Runnable against mocks with zero external network access:

```bash
npm run pipeline:demo
npm run pipeline:demo:trigger   # POSTs a synthetic error to kick it off
```

This example is worth reading end to end - it's the single clearest demonstration of how delegation, approval gates, and guardrails compose into something safe enough to run unattended.

## [support-bot](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/support-bot)

A minimal, empathetic customer-support agent - the simplest possible `createAgent()` use case.

## [research-assistant](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/research-assistant)

A research agent with the built-in `http` tool wired up.

## [workflow-router](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/workflow-router)

An agent that classifies an incoming request into a fixed set of categories - a common building block for routing work to the right specialist agent or human queue.

## [doc-qa](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/doc-qa)

A question-answering agent scoped to a single fixed document.

## [slack-notifier](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/slack-notifier)

Turns a raw event description into a short, Slack-ready notification.

## [tracing](https://github.com/LinuxDevil/agent-sdk/tree/main/examples/tracing)

Runnable examples of `AgentExecutor.execute()` wired to console and OpenTelemetry trace exporters - see [Observability](../concepts/observability).

## Also worth knowing about

[`OpenRouterProvider.examples.ts`](https://github.com/LinuxDevil/agent-sdk/blob/main/examples/OpenRouterProvider.examples.ts) - not a directory, but runnable snippets showing `OpenRouterProvider` usage.

## Next Steps

- [Simple Chatbot](./chatbot) - a walked-through example on this site
- [Human-in-the-Loop](../concepts/human-in-the-loop) and [Guardrails & Safety](../concepts/guardrails-and-safety) - the concepts ops-pipeline demonstrates
