---
sidebar_position: 1
---

# Welcome to Build AI Agent SDK

**Build AI Agent SDK** is a powerful, framework-agnostic library for building intelligent AI agents. It provides a clean, type-safe API for creating agents with tools, flows, and custom capabilities.

## Why Build AI Agent SDK?

Building AI agents shouldn't be complicated. Our SDK provides:

- 🎯 **Framework Agnostic** - Works with React, Vue, Svelte, Angular, Express, or vanilla JavaScript
- 🔧 **Extensible** - Easy to add custom tools, flows, and providers
- 🧪 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 📦 **Modular** - Use only what you need with tree-shakeable exports
- 🚀 **Production Ready** - Built-in error handling, retries, and circuit breakers
- 🔒 **Secure** - Built-in encryption, hashing, and security utilities
- 💾 **Storage** - File storage with concurrency locking
- 🎨 **Templates** - Jinja2-like template rendering for prompts
- 🔄 **Streaming** - Real-time streaming responses
- 🧠 **Memory** - Conversation context and memory management

## Quick Example

Here's a simple chatbot in just a few lines of code:

```typescript
import { AgentBuilder, AgentExecutor, OpenAIProvider } from '@tajwal/build-ai-agent';

// Create an agent
const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('Customer Support Bot')
  .setPrompt('You are a helpful customer support assistant.')
  .build();

// Execute
const executor = new AgentExecutor({
  agent,
  sessionId: 'session-123',
  llmProvider: new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY })
});

const result = await executor.execute({
  messages: [{ role: 'user', content: 'Hello! I need help.' }]
});

console.log(result.response);
```

## Perfect For

- 🤖 Building chatbots and virtual assistants
- 🔄 Creating automated workflows
- 🛠️ Integrating LLMs into existing applications
- 🎯 Developing custom AI-powered tools
- 📊 Building data analysis agents
- 💼 Creating customer support systems

## Get Started

Ready to build your first AI agent? Follow our [Installation Guide](./installation) to get started, or jump straight to the [Quick Start](./quick-start) tutorial.


## License

MIT © [Almosafer](https://almosafer.com)

