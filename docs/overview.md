---
sidebar_position: 1
title: What is Build AI Agent SDK?
description: Overview of the Build AI Agent SDK, its architecture, and why it exists
---

# What is Build AI Agent SDK?

Build AI Agent SDK is a framework-agnostic TypeScript library for building intelligent AI agents with tools, workflows, and custom capabilities. It provides a clean, type-safe API that works with any JavaScript framework or runtime.

## Why Build AI Agent SDK?

Modern applications increasingly need AI capabilities, but integrating LLMs comes with significant challenges:

- **Complexity**: Managing conversations, tool execution, streaming, and state
- **Lock-in**: Provider-specific SDKs tie you to particular LLM services
- **Type Safety**: Dynamic tool calling and untyped configurations lead to runtime errors
- **Production Concerns**: Error handling, retries, rate limiting, and monitoring

Build AI Agent SDK addresses these by providing:

1. **Framework Agnostic**: Works with React, Vue, Svelte, Angular, Express, Next.js, or vanilla JavaScript
2. **Provider Agnostic**: Support for OpenAI, Anthropic, Ollama, and custom providers
3. **Type Safe**: Full TypeScript support with comprehensive type definitions
4. **Production Ready**: Built-in error handling, retries, circuit breakers, and observability
5. **Modular**: Use only what you need with tree-shakeable exports

## Architecture Overview

The SDK follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│              Your Application                        │
│         (React, Express, Next.js, etc.)             │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│         @tajwal/build-ai-agent                      │
│  ┌────────────────────────────────────────────┐    │
│  │         AgentBuilder                        │    │
│  │    (Configuration & Validation)             │    │
│  └──────────────┬──────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼──────────────────────────────┐    │
│  │         AgentExecutor                        │    │
│  │  (Orchestration & Tool Calling)             │    │
│  └──┬────────┬────────┬──────────┬────────────┘    │
│     │        │        │          │                   │
│  ┌──▼──┐  ┌─▼───┐  ┌─▼────┐  ┌──▼────────┐        │
│  │Tools│  │Flows│  │Memory│  │ Providers  │        │
│  └─────┘  └─────┘  └──────┘  └────┬───────┘        │
└────────────────────────────────────┼────────────────┘
                                     │
┌────────────────────────────────────▼────────────────┐
│         LLM Providers & Data Layer                   │
│    (OpenAI, Ollama, Database, Storage)              │
└─────────────────────────────────────────────────────┘
```

### Core Components

#### AgentBuilder
The fluent API for constructing agent configurations. Handles validation and provides type-safe configuration.

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('Support Agent')
  .setPrompt('You are a helpful assistant')
  .addTool('search', { tool: 'webSearch' })
  .build();
```

#### AgentExecutor
Orchestrates agent execution, managing message flow, tool calls, streaming, and state.

```typescript
const result = await AgentExecutor.execute({
  agent,
  input: 'Hello, world!',
  provider: llmProvider,
  toolRegistry: tools
});
```

#### ToolRegistry
Manages tool registration and execution. Tools extend agent capabilities by connecting to external systems.

```typescript
const registry = new ToolRegistry();
registry.register('weather', {
  displayName: 'Get Weather',
  tool: weatherTool
});
```

#### LLMProvider
Abstract interface for LLM providers. Enables provider-agnostic code that works with any supported LLM service.

```typescript
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
});
```

## Key Concepts

### Agents
An **agent** is a configured AI entity with a specific purpose, tools, and behavior. Agents can be chatbots, workflow executors, data analysts, or custom types.

### Tools
**Tools** are functions that agents can call to interact with external systems, perform calculations, or fetch data. They bridge the gap between LLMs and the real world.

### Flows
**Flows** are structured multi-step workflows that orchestrate complex operations. They define sequences of agent interactions and tool executions.

### Providers
**Providers** are adapters for different LLM services (OpenAI, Anthropic, Ollama). They normalize API differences and provide a consistent interface.

### Repositories
**Repositories** handle data persistence for agents, conversations, and tool results. They abstract database operations.

## When to Use Build AI Agent SDK

**Use Build AI Agent SDK when you need to:**

- Build conversational AI applications (chatbots, assistants)
- Create workflow automation with AI decision-making
- Integrate LLM capabilities into existing applications
- Build multi-agent systems with tool calling
- Need provider flexibility (switch between OpenAI, Ollama, etc.)
- Require type safety and production-grade error handling

**Consider alternatives when:**

- You only need simple prompt completion (use provider SDKs directly)
- You're building a simple prototype without tool calling
- Your use case is covered by high-level frameworks (Langchain, etc.)

## Version Compatibility

| SDK Version | Node.js | TypeScript | Vercel AI SDK | Zod |
|-------------|---------|------------|---------------|-----|
| 1.0.0-alpha | ≥20.0   | ≥5.0       | ^4.1.54       | ^3.23 |

## Bundle Size

- **Full SDK**: ~120KB minified
- **Core only**: ~45KB minified
- **Tree-shakeable**: Import only what you use

## Browser Support

The SDK works in modern browsers via bundlers (webpack, Vite, etc.). Some features require polyfills:

- `crypto` for encryption utilities (Node.js only)
- `fs` for file storage (Node.js only)

For browser-only usage, exclude server-side modules:

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      'crypto': false,
      'fs': false,
    }
  }
}
```

## Next Steps

<div className="next-steps">

- **[Installation](./installation)** - Set up the SDK in your project
- **[Quick Start](./quick-start)** - Build your first agent in 5 minutes
- **[Core Concepts](./concepts/agents)** - Understand agents, tools, and flows
- **[API Reference](./api/agent-builder)** - Complete API documentation
- **[Tutorials](./tutorials/building-chatbot)** - Step-by-step guides

</div>

## Community & Support

- 📖 **Documentation**: [docs.tajwal.com](https://docs.tajwal.com)
- 💬 **Discord**: [discord.gg/tajwal](https://discord.gg/tajwal)
- 🐛 **Issues**: [GitHub Issues](https://github.com/tajwal/build-ai-agent/issues)
- 📧 **Email**: support@tajwal.com

## License

MIT © Tajwal Team

---

**Last Updated**: January 2025 | **SDK Version**: 1.0.0-alpha.8
