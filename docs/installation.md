---
sidebar_position: 2
---

# Installation

Get started with Build AI Agent SDK by installing it in your project.

## Requirements

- **Node.js** version 18 or newer (`engines.node` in `package.json`)
- **npm**, **pnpm**, or **yarn** package manager
- **TypeScript** is optional but recommended - the SDK ships full type definitions

## Install the SDK

```bash npm2yarn
npm install @loushy/build-ai-agent ai zod
```

`ai` (the Vercel AI SDK, `^4.3.19`) and `zod` (`^3.25.76`) are required peer dependencies.

## Provider packages

Each real LLM provider is backed by an optional peer dependency:

| Provider   | Package               | Range     |
| ---------- | ---------------------- | --------- |
| OpenAI     | `@ai-sdk/openai`       | `^0.0.42` |
| OpenRouter | `@ai-sdk/openai`       | `^0.0.42` |
| Anthropic  | `@ai-sdk/anthropic`    | `^0.0.42` |
| Ollama     | `ollama-ai-provider`   | `^1.2.0`  |

:::note Current limitation
The package's root entry point (`@loushy/build-ai-agent`) loads every provider module when it is imported, so today all three provider packages must be installed even if you only use one provider (or only the built-in mock provider):

```bash
npm install @ai-sdk/openai@^0.0.42 @ai-sdk/anthropic@^0.0.42 ollama-ai-provider@^1.2.0
```
:::

## Verify installation

```typescript title="test.ts"
import { createAgent, createMockProvider } from '@loushy/build-ai-agent';

const agent = createAgent({
  prompt: 'You are a helpful assistant.',
  provider: createMockProvider({ responses: ['Agent created successfully!'] }),
});

const result = await agent.send('ping');
console.log(result.text);
```

Run it:

```bash
npx tsx test.ts
```

If you see "Agent created successfully!", you're all set! 🎉

## Scaffolding a new project

`create-loushy-agent` scaffolds a ready-to-build project (`package.json`, `tsconfig.json`, `src/agent.ts` calling `createAgent()`, and a `.env.example` naming your provider's credential variable):

```bash
npx create-loushy-agent --name=my-agent --provider=openai --yes
```

## The `loushy` CLI

Installing the package also installs the `loushy` command:

- `loushy dev <spec.yaml|spec.json>` - local dev server with a chat UI and hot reload (see [Configuration](/docs/guides/cli)).
- `loushy build --target=<target> --agent=<spec>` - build a deployable artifact (see [Deployment](/docs/guides/deployment)). Building requires `tsup` (`npm install --save-dev tsup`).

## TypeScript configuration

If you encounter TypeScript errors, make sure your `tsconfig.json` includes:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

For ESM projects, ensure your `package.json` has `"type": "module"`. For CommonJS projects, use a `.cjs` extension or remove that field.

## Next Steps

Now that you have the SDK installed:

1. Follow the [Quick Start](./quick-start) guide to build your first agent
2. Learn about [Core Concepts](./concepts/agents)
3. Explore [Examples](./examples/chatbot)

## Need Help?

- 🐛 Report issues on [GitHub](https://github.com/LinuxDevil/agent-sdk/issues)
