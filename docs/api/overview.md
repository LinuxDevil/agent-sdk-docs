---
sidebar_position: 1
---

# API Overview

Complete API reference for Build AI Agent SDK.

## Installation

```bash npm2yarn
npm install @tajwal/build-ai-agent ai zod
```

## Core Modules

### Main Exports

```typescript
import {
  // Agent Building
  AgentBuilder,
  AgentExecutor,
  AgentType,
  
  // Tools
  ToolRegistry,
  
  // Flows
  FlowBuilder,
  FlowExecutor,
  FlowNodeType,
  
  // Providers
  OpenAIProvider,
  OllamaProvider,
  MockProvider,
  
  // Utilities
  MemoryManager,
  StorageService,
  EncryptionUtils,
  renderTemplate,
  
  // Repositories
  createMockRepositories,
  
  // Types
  Agent,
  Tool,
  Flow,
  Message,
  ExecutionResult,
} from '@tajwal/build-ai-agent';
```

## Module Exports

### Core (`@tajwal/build-ai-agent/core`)

```typescript
import {
  AgentBuilder,
  AgentExecutor,
  AgentType,
  AgentConfig,
} from '@tajwal/build-ai-agent/core';
```

### Tools (`@tajwal/build-ai-agent/tools`)

```typescript
import {
  ToolRegistry,
  Tool,
  ToolDefinition,
  ToolExecutor,
} from '@tajwal/build-ai-agent/tools';
```

### Flows (`@tajwal/build-ai-agent/flows`)

```typescript
import {
  FlowBuilder,
  FlowExecutor,
  FlowNodeType,
  Flow,
  FlowNode,
  FlowEdge,
} from '@tajwal/build-ai-agent/flows';
```

### Types (`@tajwal/build-ai-agent/types`)

```typescript
import {
  Agent,
  Tool,
  Flow,
  Message,
  ExecutionResult,
  StreamChunk,
} from '@tajwal/build-ai-agent/types';
```

## Quick Reference

### Creating an Agent

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('My Agent')
  .setPrompt('System prompt')
  .addTool('toolName', { tool: 'toolId' })
  .build();
```

### Executing Agent

```typescript
const executor = new AgentExecutor({
  agent,
  sessionId: 'session-id',
  repositories,
  llmProvider
});

const result = await executor.execute({
  messages: [{ role: 'user', content: 'Hello' }]
});
```

### Registering Tools

```typescript
const registry = new ToolRegistry();

registry.register({
  name: 'myTool',
  description: 'Tool description',
  parameters: z.object({ param: z.string() }),
  execute: async ({ param }) => ({ result: param })
});
```

### Building Flows

```typescript
const flow = new FlowBuilder()
  .addNode({ id: '1', type: FlowNodeType.LLM, data: {} })
  .addNode({ id: '2', type: FlowNodeType.Tool, data: {} })
  .addEdge('1', '2')
  .build();
```

## API Documentation Structure

### Core API
- AgentBuilder - Build and configure agents
- AgentExecutor - Execute agent conversations
- AgentTypes - Available agent types

### Tools API
- ToolRegistry - Manage tools
- Built-in Tools - Pre-built tools
- Custom Tools - Creating custom tools

### Flows API
- FlowBuilder - Build workflows
- FlowExecutor - Execute workflows
- FlowNodes - Node types and configuration

### Providers API
- OpenAIProvider - OpenAI integration
- OllamaProvider - Ollama integration
- MockProvider - Testing provider

### Utilities API
- MemoryManager - Context management
- StorageService - File storage
- EncryptionUtils - Security utilities
- TemplateRenderer - Template rendering

### Types API
- Agent Types - Agent type definitions
- Tool Types - Tool type definitions
- Flow Types - Flow type definitions
- Message Types - Message type definitions

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type {
  Agent,
  AgentConfig,
  Tool,
  ToolDefinition,
  Flow,
  FlowNode,
  Message,
  ExecutionResult,
} from '@tajwal/build-ai-agent';
```

## Version Compatibility

| SDK Version | Node.js | TypeScript | ai (Vercel) | Zod |
|-------------|---------|------------|-------------|-----|
| 1.0.x       | ≥20.0   | ≥5.0       | ^4.1.54     | ^3.23 |

## Browser Support

The SDK can be used in browsers with appropriate bundling:

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
    }
  }
};
```

## Common Patterns

### Error Handling

```typescript
try {
  const result = await executor.execute({ messages });
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Handle rate limit
  } else if (error.code === 'INVALID_API_KEY') {
    // Handle auth error
  } else {
    // Handle other errors
  }
}
```

### Streaming

```typescript
const stream = await executor.executeStream({ messages });

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

### Tool Execution

```typescript
const executor = new AgentExecutor({
  agent,
  sessionId,
  repositories,
  llmProvider,
  toolRegistry,
  onToolExecute: (toolName, params) => {
    console.log(`Executing tool: ${toolName}`, params);
  }
});
```

## Next Steps

- Explore Core API documentation
- Learn about Tools API
- Check Types Reference
