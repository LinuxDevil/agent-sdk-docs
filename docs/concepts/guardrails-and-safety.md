---
sidebar_position: 5
---

# Guardrails & Safety

Approval gates (see [Human-in-the-Loop](./human-in-the-loop)) stop an agent before it *tries* a sensitive action. Guardrails check what an agent *produced* - a diff, a command's output - before it's trusted to take effect. Sandboxing controls *where* a tool's code actually runs. Together, these are what make it reasonable to let an agent open a real pull request unattended.

## Guardrails

A `Guardrail` is a fail-closed, async check over a `ProposedAction`:

```typescript
interface ProposedAction {
  diff?: string;
  // ...other context a guardrail may need
}

interface Guardrail {
  name: string;
  run(action: ProposedAction): Promise<GuardrailResult>;
}
```

`runGuardrails()` runs a list of them **concurrently** and fails closed - any guardrail erroring or failing blocks the action:

```typescript
import { runGuardrails, secretScanGuardrail, createDiffSizeGuardrail, createCommandGuardrail } from '@loushy/build-ai-agent';

const verdict = await runGuardrails(
  { diff: patch },
  [
    secretScanGuardrail,
    createDiffSizeGuardrail(500),
    createCommandGuardrail('test-run', repoPath, 'npm', ['test']),
  ],
);

if (!verdict.pass) {
  console.log(verdict.failures); // [{ name, reason }, ...] — never call the write-side tool
}
```

### Built-in guardrails

| Export                                    | Checks                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `secretScanGuardrail`                      | The diff doesn't introduce anything that looks like a secret/credential. |
| `createDiffSizeGuardrail(maxLines)`        | The diff doesn't exceed `maxLines` changed lines.                       |
| `createCommandGuardrail(name, cwd, cmd, args)` | Runs an arbitrary command (e.g. `npm test`, a linter) and fails the guardrail on a non-zero exit. |
| `createTestRunGuardrail(...)` / `createLintGuardrail(...)` | Convenience wrappers around `createCommandGuardrail` for test/lint commands. |

### Why this matters

A fixer agent that proposes a patch is not automatically trustworthy - it can hallucinate, leak a secret into a diff, or produce an enormous unreviewable change. Guardrails are the gate between "an agent generated something" and "that something is allowed to become a real PR, deploy, or write." Always check `verdict.pass` before calling the write-side tool (e.g. opening a PR) - never call it inside the same step that ran the guardrails without checking the result.

## Sandboxing

A tool flagged `requiresSandbox` on its `ToolDescriptor` runs through a `SandboxAdapter` instead of directly in-process (see [Tools](./tools) for the descriptor shape). `AgentExecutor.execute()` takes a `sandbox` option:

```typescript
import { AgentExecutor, SubprocessSandbox, NoopSandbox } from '@loushy/build-ai-agent';

// Default when `sandbox` is omitted - zero isolation, trusted-host adapter.
// Fine for tools you trust to run directly, not for arbitrary agent-written code.
await AgentExecutor.execute({ agent, input, provider, toolRegistry, sandbox: NoopSandbox });

// A real, process-isolated sandbox - must be constructed with `new`, unlike
// NoopSandbox which is a ready-made singleton.
await AgentExecutor.execute({ agent, input, provider, toolRegistry, sandbox: new SubprocessSandbox() });
```

`SandboxAdapter` exposes `run()` (execute a command, get back `{ stdout, stderr, exitCode }`) and `writeFile()` for staging input. A tool's `sandboxExecute(args, sandbox)` is where you actually call those.

## Hardened built-in tools

Some built-in tools are hardened against common agent-security failure modes out of the box:

- **`httpTool`** is SSRF-hardened - it rejects requests to private/internal network ranges by default.
- **The GitHub tool** (used by the ops-pipeline example) is scope-limited - it's configured with the minimum GitHub permissions needed (e.g. open a PR on one repo) rather than a broad personal-access-token scope.

## Putting it together: the ops-pipeline shape

The flagship [ops-pipeline example](../examples/gallery) chains all three concepts: a monitor triggers a fixer agent (delegation), which proposes a patch (guarded by a human-approval gate via Slack), whose diff is then checked by `runGuardrails()` before a PR-opening tool (running through a sandbox) is finally allowed to execute.

## Next Steps

- [Human-in-the-Loop](./human-in-the-loop) - the approval gate that runs *before* a guardrail
- [Observability](./observability) - tracing guardrail and sandbox runs
- [`api/overview`](../api/overview) - full export list for guardrails and sandboxing
