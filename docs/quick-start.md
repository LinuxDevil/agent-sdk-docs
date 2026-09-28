---
sidebar_position: 3
---

# Quick Start

This guide builds up from the simplest possible agent to the full `AgentBuilder` + `AgentExecutor` API and declarative spec files. Every snippet below mirrors the SDK's own [verified quick-start](https://github.com/LinuxDevil/agent-sdk/blob/main/docs/quick-start.md), whose code is executed for real against a packed build by the SDK's `scripts/verify-docs-snippets.ts` - so it's kept honest against the real API. All snippets run as-is with the built-in mock provider, no API key needed.

## 1. One-liner agent with `createAgent()`

`createAgent()` is the zero-config entry point: a prompt and a provider in, a `{ send }` agent out.

```typescript title="agent.ts"
import { createAgent, createMockProvider } from '@loushy/build-ai-agent';

const agent = createAgent({
  prompt: 'You are a helpful assistant.',
  provider: createMockProvider({ responses: ['Hello! How can I help you today?'] }),
});

const result = await agent.send('Hi there');
console.log(result.text); // "Hello! How can I help you today?"
```

```bash
npx tsx agent.ts
```

## 2. Switching to a real provider

`resolveProvider('<provider>/<model>')` builds a real provider, reading its credential from the environment (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, or `OLLAMA_BASE_URL` for Ollama).

```typescript title="real-provider.ts"
import { createAgent, createMockProvider, resolveProvider } from '@loushy/build-ai-agent';

const provider = process.env.OPENAI_API_KEY
  ? resolveProvider('openai/gpt-4o-mini')
  : createMockProvider({ responses: ['Paris.'] });

const agent = createAgent({
  name: 'geography-bot',
  prompt: 'Answer geography questions in one word.',
  provider,
});

const result = await agent.send('What is the capital of France?');
console.log(result.text);
```

```bash
export OPENAI_API_KEY="your-api-key"   # optional - falls back to the mock provider
npx tsx real-provider.ts
```

## 3. Adding tools

Tools are passed to `createAgent()` keyed by the name the agent calls them by. The SDK ships several built-in tools (`currentDateTool`, `dayNameTool`, `httpTool`, ...).

```typescript title="agent-with-tools.ts"
import { createAgent, createMockProvider, currentDateTool } from '@loushy/build-ai-agent';

const agent = createAgent({
  prompt: 'You are a scheduling assistant. Use tools when helpful.',
  provider: createMockProvider({ responses: ['Let me check.', 'Here is the date you asked for.'] }),
  tools: { current_date: currentDateTool },
});

const result = await agent.send('Please call current_date for me');
console.log(result.toolCalls.map((call) => call.function.name)); // [ 'current_date' ]
console.log(result.text);
```

Register a custom tool the same way, wrapped from the Vercel AI SDK's `tool()`:

```typescript title="custom-tool.ts"
import { createAgent, createMockProvider } from '@loushy/build-ai-agent';
import { tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get current weather for a location',
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => ({ temperature: 72, conditions: 'sunny', location }),
});

const agent = createAgent({
  prompt: 'You are a weather assistant. Use the weather tool when asked.',
  provider: createMockProvider({ responses: ['Checking...', 'It is sunny and 72°F.'] }),
  tools: { weather: weatherTool },
});
```

## 4. Full control: `AgentBuilder` + `AgentExecutor`

`createAgent()` is a thin wrapper over `AgentBuilder` and the static `AgentExecutor.execute()`. Use them directly when you need the full set of execution options (`maxSteps`, `temperature`, `onEvent`, approvals, checkpoints, tracing, ...). `AgentExecutor` is a **static** API - there is no `new AgentExecutor()`.

```typescript title="full-control.ts"
import {
  AgentBuilder,
  AgentExecutor,
  AgentType,
  createMockProvider,
} from '@loushy/build-ai-agent';

const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setName('Customer Support Agent')
  .setPrompt('You are a helpful customer support assistant.')
  .build();

const events: string[] = [];
const result = await AgentExecutor.execute({
  agent,
  input: 'My order arrived damaged.',
  provider: createMockProvider({ responses: ["I'm sorry to hear that - what's your order number?"] }),
  maxSteps: 5,
  onEvent: (event) => events.push(event.type),
});

console.log(result.text);
console.log(result.usage.totalTokens, result.finishReason, result.steps);
console.log(events); // includes 'start' and 'finish'
```

`AgentBuilder`/`createAgent()` only build the `AgentConfig` and the tool registry - reach for this form whenever you need approvals, delegation, checkpoints, guardrails, or tracing, all of which are options on `AgentExecutor.execute()`. See [Human-in-the-Loop](./concepts/human-in-the-loop), [Delegation](./concepts/delegation), and [Observability](./concepts/observability) for those.

## 5. Declarative agents: spec files

An agent can also be described as plain data - an `AgentSpec` - and turned into a live agent with `specToAgent()`. The same shape can be written as a YAML or JSON file and loaded with `loadSpec()`.

```typescript title="spec.ts"
import { specToAgent, agentSpecSchema } from '@loushy/build-ai-agent';

const spec = agentSpecSchema.parse({
  name: 'support-bot',
  prompt: 'You are a friendly support agent.',
  provider: { type: 'mock', model: 'mock-1' },
  tools: ['current-date'],
});

const agent = specToAgent(spec);
const result = await agent.send('Hello!');
console.log(result.text);
```

Saved as `agent.yaml`:

```yaml title="agent.yaml"
name: support-bot
prompt: You are a friendly support agent.
provider:
  type: mock
  model: mock-1
tools:
  - current-date
```

the same spec runs in the local dev server (chat UI at `/`, `POST /chat`, hot reload on save) and builds into a deployable server:

```bash
npx loushy dev agent.yaml
npx loushy build --target=node-server --agent=agent.yaml
```

See [Declarative Specs](./concepts/declarative-specs) for the full field reference and the [CLI guide](./guides/cli) for `loushy dev`/`loushy build`.

## Next steps

1. **[Core Concepts](./concepts/agents)** - agents, tools, human-in-the-loop, delegation, guardrails, observability
2. **[Declarative Specs](./concepts/declarative-specs)** - every spec field, provider env var
3. **[Deployment](./guides/deployment)** - `loushy build` targets (Node server, Docker, Cloudflare Workers)
4. **[Examples](./examples/chatbot)** - real-world examples, including the flagship ops-pipeline demo
5. **[API Reference](./api/overview)** - complete API documentation

## Need Help?

- 🐛 Report issues on [GitHub](https://github.com/LinuxDevil/agent-sdk/issues)
