---
sidebar_position: 3
---

# Quick Start

This guide will help you build your first AI agent in just a few minutes.

## Your First Agent

Let's create a simple chatbot that can answer questions.

### Step 1: Import the SDK

```typescript
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider,
  createMockRepositories 
} from '@tajwal/build-ai-agent';
```

### Step 2: Build the Agent

```typescript
const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('My First Agent')
  .setPrompt('You are a helpful and friendly assistant.')
  .build();
```

### Step 3: Configure the Executor

```typescript
// Create mock repositories for testing
const repositories = createMockRepositories();

// Configure LLM provider
const llmProvider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});

// Create executor
const executor = new AgentExecutor({
  agent,
  sessionId: 'my-session-123',
  repositories,
  llmProvider
});
```

### Step 4: Execute

```typescript
const result = await executor.execute({
  messages: [
    { role: 'user', content: 'Hello! What can you help me with?' }
  ]
});

console.log(result.response);
```

## Complete Example

Here's the full code:

```typescript title="my-first-agent.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider,
  createMockRepositories 
} from '@tajwal/build-ai-agent';

async function main() {
  // Build the agent
  const agent = new AgentBuilder()
    .setType('chatbot')
    .setName('My First Agent')
    .setPrompt('You are a helpful and friendly assistant.')
    .build();

  // Configure repositories and provider
  const repositories = createMockRepositories();
  const llmProvider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  });

  // Create executor
  const executor = new AgentExecutor({
    agent,
    sessionId: 'my-session-123',
    repositories,
    llmProvider
  });

  // Execute
  const result = await executor.execute({
    messages: [
      { role: 'user', content: 'Hello! What can you help me with?' }
    ]
  });

  console.log('Agent Response:', result.response);
}

main().catch(console.error);
```

Run it:

```bash
export OPENAI_API_KEY="your-api-key"
npx tsx my-first-agent.ts
```

## Adding Tools

Let's enhance our agent with tools. Here's an agent that can perform calculations:

```typescript title="agent-with-tools.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider,
  createMockRepositories,
  ToolRegistry 
} from '@tajwal/build-ai-agent';
import { z } from 'zod';

// Register a custom tool
const toolRegistry = new ToolRegistry();
toolRegistry.register({
  name: 'calculator',
  description: 'Performs mathematical calculations',
  parameters: z.object({
    expression: z.string().describe('Mathematical expression to evaluate')
  }),
  execute: async ({ expression }) => {
    try {
      // Note: In production, use a proper math parser
      const result = eval(expression);
      return { result };
    } catch (error) {
      return { error: 'Invalid expression' };
    }
  }
});

// Build agent with tools
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .setName('Math Helper')
  .setPrompt('You are a math assistant. Use the calculator tool for calculations.')
  .addTool('calculator', { tool: 'calculator' })
  .build();

// Create executor with tool registry
const executor = new AgentExecutor({
  agent,
  sessionId: 'math-session',
  repositories: createMockRepositories(),
  llmProvider: new OpenAIProvider({ 
    apiKey: process.env.OPENAI_API_KEY 
  }),
  toolRegistry
});

// Execute
const result = await executor.execute({
  messages: [
    { role: 'user', content: 'What is 25 multiplied by 37?' }
  ]
});

console.log(result.response);
```

## Streaming Responses

For real-time streaming responses:

```typescript title="streaming-agent.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider,
  createMockRepositories 
} from '@tajwal/build-ai-agent';

async function streamingExample() {
  const agent = new AgentBuilder()
    .setType('chatbot')
    .setName('Streaming Bot')
    .setPrompt('You are a helpful assistant.')
    .build();

  const executor = new AgentExecutor({
    agent,
    sessionId: 'stream-session',
    repositories: createMockRepositories(),
    llmProvider: new OpenAIProvider({ 
      apiKey: process.env.OPENAI_API_KEY 
    })
  });

  // Stream the response
  const stream = await executor.executeStream({
    messages: [
      { role: 'user', content: 'Tell me a short story about AI.' }
    ]
  });

  // Process chunks as they arrive
  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }
}

streamingExample().catch(console.error);
```

## Using Local LLMs with Ollama

You can also use local models with Ollama:

```typescript title="ollama-agent.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OllamaProvider,
  createMockRepositories 
} from '@tajwal/build-ai-agent';

const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('Local Agent')
  .setPrompt('You are a helpful assistant.')
  .build();

// Use Ollama provider
const executor = new AgentExecutor({
  agent,
  sessionId: 'ollama-session',
  repositories: createMockRepositories(),
  llmProvider: new OllamaProvider({
    model: 'llama2',
    baseUrl: 'http://localhost:11434'
  })
});

const result = await executor.execute({
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(result.response);
```

## Production Setup with Database

For production, use a proper database instead of mock repositories:

```typescript title="production-agent.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider 
} from '@tajwal/build-ai-agent';
import { createDrizzleRepositories } from '@tajwal/build-ai-agent-drizzle';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Setup database
const sqlite = new Database('agent.db');
const db = drizzle(sqlite);

// Create repositories with database
const repositories = createDrizzleRepositories(db);

// Build agent
const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('Production Agent')
  .setPrompt('You are a helpful assistant.')
  .build();

// Create executor
const executor = new AgentExecutor({
  agent,
  sessionId: 'prod-session',
  repositories,
  llmProvider: new OpenAIProvider({ 
    apiKey: process.env.OPENAI_API_KEY 
  })
});

// Execute
const result = await executor.execute({
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(result.response);
```

## Next Steps

Now that you've built your first agent, explore:

1. **[Core Concepts](./concepts/agents)** - Understand agents, tools, and flows
2. **Building Agents** - Advanced agent configuration
3. **Creating Tools** - Build custom capabilities
4. **[Examples](./examples/chatbot)** - Real-world examples
5. **[API Reference](./api/overview)** - Complete API documentation

## Need Help?

- 💬 Join our [Discord Community](https://discord.gg/tajwal)
- 🐛 Report issues on [GitHub](https://github.com/tajwal/build-ai-agent/issues)
- 📧 Email us at [support@tajwal.com](mailto:support@tajwal.com)
