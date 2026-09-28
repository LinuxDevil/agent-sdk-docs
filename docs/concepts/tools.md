---
sidebar_position: 2
---

# Tools

Tools extend agent capabilities by allowing them to interact with external systems, perform calculations, fetch data, and more.

## What are Tools?

Tools are functions that agents can call to:

- Fetch external data (APIs, databases)
- Perform calculations or transformations
- Execute actions (send emails, update records, open a pull request)
- Access services (search engines, file systems)

Under the hood a tool is a `ToolDescriptor`:

```typescript
interface ToolDescriptor {
  displayName: string;
  tool: AITool; // built with the Vercel AI SDK's `tool()`
  needsApproval?: boolean | ((args: any) => boolean | Promise<boolean>);
  requiresSandbox?: boolean;
  sandboxExecute?: (args: any, sandbox: SandboxAdapter) => Promise<unknown>;
  injectStreamingController?: (controller: ReadableStreamDefaultController<unknown>) => void;
}
```

## Built-in Tools

The SDK ships a few ready-to-use tools:

| Tool               | What it does                                   |
| ------------------- | ------------------------------------------------ |
| `httpTool`          | Makes HTTP requests (SSRF-hardened)             |
| `currentDateTool`   | Returns the current date/time (ISO, UTC)        |
| `dayNameTool`       | Returns the day of the week                     |

```typescript
import { createAgent, createMockProvider, currentDateTool, httpTool } from '@loushy/build-ai-agent';

const agent = createAgent({
  prompt: 'You are a scheduling assistant. Use tools when helpful.',
  provider: createMockProvider({ responses: ['Let me check.', 'Done.'] }),
  tools: { current_date: currentDateTool, http: httpTool },
});
```

A spec file (see [Declarative Specs](./declarative-specs)) can reference `current-date`, `day-name`, and `http` by name; `github` and `jira` tools need credentials a spec has no field for, so build the agent with `createAgent()`/`AgentBuilder` and pass a configured tool instead when you need them.

## Creating Custom Tools

Tools are built with the Vercel AI SDK's `tool()` helper and registered on a `ToolRegistry`. **`ToolRegistry.register()` takes two positional arguments - the tool's name and its `ToolDescriptor` - not a single object.**

```typescript
import { ToolRegistry } from '@loushy/build-ai-agent';
import { tool } from 'ai';
import { z } from 'zod';

const registry = new ToolRegistry();

registry.register('weather', {
  displayName: 'Get weather',
  tool: tool({
    description: 'Get current weather for a location',
    parameters: z.object({
      location: z.string().describe('City name or zip code'),
      units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
    }),
    execute: async ({ location, units }) => {
      const response = await fetch(`https://api.weather.com/v1/current?location=${location}&units=${units}`);
      const data = await response.json();
      return { temperature: data.temp, conditions: data.conditions };
    },
  }),
});
```

### Error handling inside a tool

Return the error as data rather than throwing - the LLM sees the tool result and can react to it:

```typescript
execute: async ({ symbol }) => {
  try {
    const response = await fetch(`https://api.stocks.com/quote/${symbol}`);
    if (!response.ok) throw new Error(`Stock not found: ${symbol}`);
    return await response.json();
  } catch (error) {
    return { error: (error as Error).message, symbol };
  }
};
```

## Approval gates: `needsApproval`

Flag any tool with a real-world side effect `needsApproval`. `AgentExecutor` pauses *before* invoking the tool and persists an `ExecutionSnapshot` instead - it does not call the tool. A human (or your own policy code) approves or rejects it, then the run resumes with `resumeAfterApproval()`.

```typescript
registry.register('send_email', {
  displayName: 'Send email',
  tool: emailTool,
  // boolean, or a predicate over the tool's arguments
  needsApproval: (args) => args.to.includes('@external.com'),
});
```

See [Human-in-the-Loop](./human-in-the-loop) for the full approval-store/resume flow.

## Sandboxing: `requiresSandbox` and `sandboxExecute`

Flag a tool `requiresSandbox` to route its execution through the configured `SandboxAdapter` (passed as `AgentExecutor.execute()`'s `sandbox` option) instead of calling `tool.execute()` directly in-process. Implement `sandboxExecute` to actually use the sandbox:

```typescript
registry.register('run_script', {
  displayName: 'Run script',
  tool: scriptTool,
  requiresSandbox: true,
  sandboxExecute: async (args, sandbox) => {
    await sandbox.writeFile('input.json', JSON.stringify(args));
    const result = await sandbox.run('node', ['run.js', 'input.json']);
    return JSON.parse(result.stdout);
  },
});

// AgentExecutor.execute() defaults to NoopSandbox (zero isolation, trusted
// host) when `sandbox` is omitted. Pass a real one for anything untrusted:
import { SubprocessSandbox } from '@loushy/build-ai-agent';
await AgentExecutor.execute({ agent, input, provider, toolRegistry: registry, sandbox: new SubprocessSandbox() });
```

`NoopSandbox` and `SubprocessSandbox` are the two adapters the SDK ships; `SubprocessSandbox` must be constructed with `new` (it is not a ready singleton like `NoopSandbox`). See [Guardrails & Safety](./guardrails-and-safety) for how sandboxing fits alongside guardrails in a real pipeline.

## Using Tools in Agents

```typescript
import { AgentBuilder, AgentExecutor, AgentType } from '@loushy/build-ai-agent';

const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setPrompt('You can check the weather. Use the weather tool when asked.')
  .addTool('weather', { tool: 'weather' }) // references a name in the ToolRegistry
  .build();

const result = await AgentExecutor.execute({
  agent,
  input: "What's the weather in London?",
  provider,
  toolRegistry: registry,
});
```

`AgentBuilder.addTool(key, config)` records *which* tools the agent config refers to (by name); the actual `ToolDescriptor` implementations live in the `ToolRegistry` passed to `AgentExecutor.execute()` as `toolRegistry`.

## ToolRegistry Reference

```typescript
const registry = new ToolRegistry();

registry.register('tool1', descriptor);       // register one
registry.registerMany({ tool2: descriptor2 }); // register several at once

registry.get('tool1');      // ToolDescriptor | undefined
registry.has('tool1');      // boolean
registry.list();            // string[] of registered names
registry.getAll();          // Record<string, ToolDescriptor>
registry.unregister('tool1'); // boolean
registry.size();            // number
```

A `globalToolRegistry` singleton instance is also exported for convenience, but most applications construct their own registry per agent.

## Tool Execution Flow

```
User Input
    ↓
Agent processes with LLM
    ↓
LLM decides to call a tool
    ↓
needsApproval? ──yes──► pause, persist ExecutionSnapshot, wait for a human
    │no
    ▼
requiresSandbox? ──yes──► sandboxExecute(args, sandbox)
    │no
    ▼
tool.execute(args)
    ↓
Result returned to the LLM
    ↓
LLM formulates a response
```

## MCP Tools

Any Model Context Protocol server's tools can be loaded as `ToolDescriptor`s and registered like any other tool:

```typescript
import { loadMcpTools } from '@loushy/build-ai-agent/tools/mcp/McpToolLoader';

const linearTools = await loadMcpTools(mcpClient, 'linear');
registry.registerMany(linearTools); // namespaced <connection>__<tool>
```

## Best Practices

1. **Clear tool descriptions** - the LLM only knows what the `description` tells it.
2. **Detailed parameter schemas** - use `.describe()` on every zod field.
3. **Return errors as data, not throws** - so the LLM can recover in-conversation.
4. **Gate anything with a real side effect** with `needsApproval`, and anything that runs code or touches disk with `requiresSandbox`.
5. **Register only what's needed** - fewer tools means a smaller attack surface and a less confused model.

## Next Steps

- [Human-in-the-Loop](./human-in-the-loop) - approval gates in depth
- [Guardrails & Safety](./guardrails-and-safety) - guardrails, sandboxing, and hardened built-in tools
- [Observability](./observability) - tracing tool calls
