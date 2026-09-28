---
sidebar_position: 3
---

# Human-in-the-Loop

Some tool calls shouldn't happen without a human saying yes - sending an external email, spending money, opening a PR. The SDK builds this in as a first-class pause/resume flow, plus durable checkpoints so a long-running or interrupted conversation survives a crash or restart.

## Approval gates

Flag a tool `needsApproval` (a boolean, or a predicate over its arguments) on the `ToolDescriptor`. When `AgentExecutor.execute()` reaches a call to that tool, it does **not** invoke it - instead it persists an `ExecutionSnapshot` (the conversation state at the point of the pending call) to an `ApprovalStore` and returns immediately with `finishReason: 'awaiting-approval'` and an `approvalId`.

```typescript
import { AgentExecutor, StorageServiceApprovalStore } from '@loushy/build-ai-agent';

const approvalStore = new StorageServiceApprovalStore(storage);

const paused = await AgentExecutor.execute({
  agent,
  input,
  provider,
  toolRegistry,
  approvalStore,
});
// paused.finishReason === 'awaiting-approval'
// paused.approvalId is set - hand it to whatever surfaces the approval UI
```

## Resuming after a decision

Once a human approves or rejects (in a Slack message, an admin panel, wherever), call `resumeAfterApproval()` - from any process, since the snapshot was durably persisted:

```typescript
import { resumeAfterApproval } from '@loushy/build-ai-agent';

const result = await resumeAfterApproval(
  { id: paused.approvalId!, approved: true },
  approvalStore,
  provider,
  toolRegistry,
);
```

If `approved` is `false`, the run resumes with the tool call rejected - the LLM sees a rejection result and can respond accordingly rather than having the tool silently run.

### `StorageServiceApprovalStore`

The built-in `ApprovalStore` implementation persists pending approvals via `StorageService`. Implement the `ApprovalStore` interface yourself to back it with a database instead.

## Durable execution (checkpoints)

Independent of approvals, pass a `sessionId` and a `checkpointStore` to make a conversation resumable across a crash or process restart. `AgentExecutor` saves a checkpoint after every tool result and rehydrates from it on the next call with the same `sessionId`.

```typescript
import { AgentExecutor, LocalStorageCheckpointStore } from '@loushy/build-ai-agent';

const checkpointStore = new LocalStorageCheckpointStore(storage);

await AgentExecutor.execute({
  agent, input, provider, sessionId: 'session-123', checkpointStore,
});

// ...process crashes or restarts...

await AgentExecutor.execute({
  agent, input: 'continue', provider, sessionId: 'session-123', checkpointStore,
});
// picks up from the last saved checkpoint instead of starting over
```

`LocalStorageCheckpointStore` is the built-in `CheckpointStore` backed by `StorageService`; implement the `CheckpointStore` interface for a different backend.

## Combining both

Approvals and checkpoints compose - a real deployment typically wires up both a `checkpointStore` (so a long tool-calling loop survives a restart) and an `approvalStore` (so a sensitive step still waits on a human), as the flagship [ops-pipeline example](../examples/gallery) does: a monitor triggers a fixer agent, a Slack "Fix it" button gates the fix behind human approval, and the resulting patch is guardrail-gated (see [Guardrails & Safety](./guardrails-and-safety)) before a PR is opened.

## Next Steps

- [Delegation](./delegation) - combining approval gates with multi-agent systems
- [Guardrails & Safety](./guardrails-and-safety) - what happens *after* approval, before a write-side action runs
- [`api/agent-executor`](../api/agent-executor) - the full `ExecuteOptions` reference
