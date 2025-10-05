---
sidebar_position: 2
---

# Installation

Get started with Build AI Agent SDK by installing it in your project.

## Requirements

- **Node.js** version 20.0 or higher
- **npm**, **pnpm**, or **yarn** package manager
- **TypeScript** 5.0 or higher (optional but recommended)

## Install the SDK

Choose your preferred package manager:

```bash npm2yarn
npm install @tajwal/build-ai-agent ai zod
```

## Peer Dependencies

The SDK requires these peer dependencies:

- **ai** (^4.1.54) - Vercel AI SDK for LLM interactions
- **zod** (^3.23.8) - Schema validation library

## Provider-Specific Dependencies

Depending on which LLM provider you want to use, install the appropriate package:

### OpenAI

```bash npm2yarn
npm install @ai-sdk/openai
```

### Ollama (Local LLMs)

```bash npm2yarn
npm install ollama-ai-provider
```

### Anthropic Claude

```bash npm2yarn
npm install @ai-sdk/anthropic
```

## Database Adapter (Optional)

If you need persistent storage with Drizzle ORM:

```bash npm2yarn
npm install @tajwal/build-ai-agent-drizzle drizzle-orm
```

For development and testing, you can use the built-in mock repositories (no additional installation required).

## Verify Installation

Create a simple test file to verify everything is working:

```typescript title="test.ts"
import { AgentBuilder } from '@tajwal/build-ai-agent';

const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('Test Agent')
  .setPrompt('You are a helpful assistant.')
  .build();

console.log('Agent created successfully!', agent.name);
```

Run it:

```bash
npx tsx test.ts
# or with ts-node
npx ts-node test.ts
```

If you see "Agent created successfully!", you're all set! 🎉

## Next Steps

Now that you have the SDK installed, you can:

1. Follow the [Quick Start](./quick-start) guide to build your first agent
2. Learn about [Core Concepts](./concepts/agents)
3. Explore [Examples](./examples/chatbot)

## Troubleshooting

### TypeScript Errors

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

### Module Resolution Issues

For ESM projects, ensure your `package.json` has:

```json title="package.json"
{
  "type": "module"
}
```

For CommonJS projects, use `.cjs` extension or remove the `"type": "module"` field.

### Missing Peer Dependencies

If you see peer dependency warnings, make sure all required packages are installed:

```bash npm2yarn
npm install ai zod @ai-sdk/openai
```

## IDE Setup

### VS Code

For the best development experience in VS Code, install:

- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### WebStorm / IntelliJ

WebStorm and IntelliJ IDEA have built-in TypeScript support. No additional plugins needed.

## Need Help?

If you're having trouble with installation:

- Check our [GitHub Issues](https://github.com/LinuxDevil/agent-sdk/issues)
