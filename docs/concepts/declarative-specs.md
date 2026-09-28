---
sidebar_position: 7
---

# Declarative Specs

An agent can be described as plain data - an `AgentSpec` - instead of code. This is the format `loushy dev` serves and `loushy build` deploys (see the [CLI guide](../guides/cli) and [Deployment](../guides/deployment)), and it's handy any time you want a non-developer-editable agent definition or a config-driven deploy pipeline.

## The `AgentSpec` shape

A spec is a YAML (`.yaml`/`.yml`) or JSON (`.json`) file, validated with zod by `loadSpec()`:

| Field             | Type       | Required | Description                                              |
| ------------------ | ---------- | -------- | ---------------------------------------------------------- |
| `name`            | `string`   | yes      | Agent name.                                                |
| `prompt`          | `string`   | yes      | System prompt.                                             |
| `provider.type`   | `string`   | yes      | `openai`, `anthropic`, `ollama`, `openrouter`, or `mock`.  |
| `provider.model`  | `string`   | yes      | Model id passed to the provider as its default model.     |
| `tools`           | `string[]` | no       | Built-in tool names (see below).                          |

A missing or invalid field fails with an error naming the exact field, e.g. `'prompt': Required`.

```yaml title="agent.yaml"
name: support-bot
prompt: You are a friendly support agent.
provider:
  type: openai
  model: gpt-4o-mini
tools:
  - current-date
  - http
```

### Tools a spec can reference

| Name             | Tool                                              |
| ----------------- | --------------------------------------------------- |
| `http`           | `httpTool` - HTTP requests                         |
| `current-date`   | `currentDateTool` - current date/time (ISO, UTC)   |
| `day-name`       | `dayNameTool` - day of the week                    |

`github` and `jira` need credentials a spec has no field for - referencing them throws an error telling you to build the agent with `createAgent()` instead and pass a configured tool directly.

## Loading and running a spec

```typescript
import { loadSpec, specToAgent } from '@loushy/build-ai-agent';

const spec = loadSpec('./agent.yaml');
const agent = specToAgent(spec);

const result = await agent.send('Hello!');
console.log(result.text);
```

Or build the spec in code and validate it with the schema directly:

```typescript
import { specToAgent, agentSpecSchema } from '@loushy/build-ai-agent';

const spec = agentSpecSchema.parse({
  name: 'support-bot',
  prompt: 'You are a friendly support agent.',
  provider: { type: 'mock', model: 'mock-1' },
  tools: ['current-date'],
});

const agent = specToAgent(spec);
```

`specToAgent()` resolves the `provider` field with `resolveProvider()` and the `tools` list against the built-in tool table above, then returns the same `{ send }` shape `createAgent()` does.

## Provider credentials

Real providers referenced by a spec are resolved the same way as everywhere else, by `resolveProvider('<provider>/<model>')`, which reads the credential from the environment:

| Provider     | Environment variable  |
| ------------- | ----------------------- |
| `openai`     | `OPENAI_API_KEY`       |
| `anthropic`  | `ANTHROPIC_API_KEY`    |
| `openrouter` | `OPENROUTER_API_KEY`   |
| `ollama`     | `OLLAMA_BASE_URL`      |

The `mock` provider needs no credentials and returns canned responses - useful for a spec you want to demo or test without any live key.

## Running and deploying a spec

The same spec file runs in a local dev server and builds into a deployable artifact without any code changes:

```bash
npx loushy dev agent.yaml                                 # chat UI + hot reload
npx loushy build --target=node-server --agent=agent.yaml  # or docker / cloudflare-worker
```

See the [CLI guide](../guides/cli) for `loushy dev`'s HTTP surface and reload behavior, and [Deployment](../guides/deployment) for what each build target produces.

## When to use a spec vs. code

Reach for a spec file when the agent is simple enough to be fully described by prompt + provider + a handful of built-in tools, and you want it editable/deployable without a code change (e.g. non-engineers tuning a support bot's prompt). Reach for `createAgent()`/`AgentBuilder` + `AgentExecutor` directly the moment you need a custom tool, an approval gate, delegation, checkpoints, or tracing - none of which a spec file can express today.

## Next Steps

- [CLI guide](../guides/cli) - `loushy dev`'s chat UI and hot reload
- [Deployment](../guides/deployment) - `loushy build`'s three targets
- [`api/overview`](../api/overview) - `loadSpec()`, `agentSpecSchema`, `specToAgent()`
