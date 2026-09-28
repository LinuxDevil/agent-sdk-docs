---
sidebar_position: 4
---

# Delegation

A single agent's prompt can only specialize so far before it gets unwieldy. Multi-agent delegation lets a parent agent hand a sub-task off to a child agent that's built and tuned specifically for it, while still running the whole thing through the same `AgentExecutor.execute()` call.

## `createDelegateTool()`

`createDelegateTool()` wraps a child `AgentConfig` as an ordinary `ToolDescriptor`. When the parent LLM calls it, the SDK runs the child agent through `AgentExecutor.execute()` under the hood and returns its result as the tool's output.

```typescript
import { AgentExecutor, createDelegateTool, ToolRegistry, AgentType } from '@loushy/build-ai-agent';

const billingAgent = {
  name: 'Billing Agent',
  agentType: AgentType.SmartAssistant,
  prompt: 'You answer billing questions and look up invoices.',
};

const registry = new ToolRegistry();
registry.register(
  'delegate_billing_agent',
  createDelegateTool({
    agent: billingAgent,
    provider,
    contextMode: 'none', // 'full-history' shares the parent's context array too
    maxSteps: 10,
    maxDepth: 3, // bounds a delegation chain (e.g. A -> B -> A) before it throws
  }),
);

const supportAgent = {
  name: 'Support Agent',
  agentType: AgentType.SmartAssistant,
  prompt: 'You help customers. Delegate billing questions to the billing agent.',
  tools: { delegate_billing_agent: { tool: 'delegate_billing_agent' } },
};

const result = await AgentExecutor.execute({
  agent: supportAgent,
  input: 'Why was I charged twice this month?',
  provider,
  toolRegistry: registry,
});
```

## `DelegateAgentOptions`

| Option        | Description                                                                 |
| -------------- | ---------------------------------------------------------------------------- |
| `agent`        | The child `AgentConfig` to delegate to.                                     |
| `provider`     | The `LLMProvider` the child agent runs with (can differ from the parent's). |
| `contextMode`  | `'none'` (child starts fresh) or `'full-history'` (child sees the parent's message history too). |
| `maxSteps`     | Max tool-calling iterations for the *child's* execution.                    |
| `maxDepth`     | Bounds how many levels of delegation are allowed before a `DelegationDepthExceededError` is thrown. |

## Guarding against delegation loops

`maxDepth` exists because a delegation chain can loop (agent A delegates to B, which delegates back to A) and, unguarded, that grows the number of LLM calls exponentially in the chain length. When the depth guard fires, `DelegationDepthExceededError` (a subclass of `PropagatingToolError`) is thrown and propagates straight out of `AgentExecutor.execute()` as a rejected promise - it does **not** re-enter the conversation as tool output that would prompt the LLM to just try again. Set `maxDepth` deliberately for any agent graph with more than one level of delegation.

## When to delegate vs. use a bigger prompt

Delegate when the child's job is genuinely a different skill (billing lookups vs. general support chat) or needs different tools/guardrails than the parent. If it's just "a slightly different tone for this topic," a well-scoped prompt is usually simpler than standing up a second agent.

## Next Steps

- [Human-in-the-Loop](./human-in-the-loop) - gating a delegated agent's own tools behind approval
- [Guardrails & Safety](./guardrails-and-safety) - gating what a delegated fixer agent is allowed to do
- [`api/overview`](../api/overview) - the full export list including `createDelegateTool()`
