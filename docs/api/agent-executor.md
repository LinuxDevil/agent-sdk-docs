---
sidebar_position: 2
title: AgentExecutor
description: Complete API reference for the AgentExecutor class
---

# AgentExecutor

`AgentExecutor` orchestrates agent execution, managing message flow, tool calling, streaming, error handling, and state. It's the runtime component that brings your agent configurations to life.

## Overview

After building an agent with `AgentBuilder`, you use `AgentExecutor` to actually run it. The executor handles:

- Message formatting and conversation context
- LLM provider communication
- Tool call orchestration (multi-step execution)
- Streaming response delivery
- Token usage tracking
- Error handling and retries
- Event emission for monitoring

**Import**:
```typescript
import { AgentExecutor } from '@tajwal/build-ai-agent';
// or
import { AgentExecutor } from '@tajwal/build-ai-agent/execution';
```

**Basic Usage**:
```typescript
const result = await AgentExecutor.execute({
  agent,
  input: 'Hello, world!',
  provider: llmProvider,
  toolRegistry: tools
});
```

## Static Methods

The `AgentExecutor` class provides static methods for execution - you don't instantiate it.

### `execute()`

Executes an agent with the given input and returns the complete result after all tool calls are resolved.

**Signature**:
```typescript
static async execute(options: ExecuteOptions): Promise<ExecutionResult>
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `ExecuteOptions` | Yes | Execution configuration object |

**ExecuteOptions Interface**:

```typescript
interface ExecuteOptions {
  agent: AgentConfig;          // Agent configuration to execute
  input: string | Message[];   // User input or message history
  provider: LLMProvider;       // LLM provider instance
  toolRegistry?: ToolRegistry; // Optional tool registry
  streaming?: boolean;         // Enable streaming (default: false)
  maxSteps?: number;          // Max tool call iterations (default: 10)
  temperature?: number;        // Override agent temperature
  maxTokens?: number;         // Override max tokens
  onEvent?: (event: ExecutionEvent) => void; // Event callback
}
```

**Returns**: `Promise<ExecutionResult>`

```typescript
interface ExecutionResult {
  text: string;                // Final response text
  messages: Message[];         // Complete message history
  toolCalls: ToolCall[];      // All tool calls made
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;       // Why generation stopped
  steps: number;              // Number of iterations
}
```

**Throws**:
- `Error` - If provider fails
- `Error` - If tool execution fails
- `Error` - If maxSteps exceeded with pending tool calls

**Example - Basic Execution**:
```typescript
import { AgentExecutor } from '@tajwal/build-ai-agent';

const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'What is the weather in London?',
  provider: openAIProvider,
  toolRegistry: tools
});

console.log('Response:', result.text);
console.log('Tokens used:', result.usage.totalTokens);
console.log('Tool calls:', result.toolCalls.length);
```

**Example - With Event Monitoring**:
```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Search for TypeScript tutorials',
  provider: openAIProvider,
  toolRegistry: tools,
  onEvent: (event) => {
    switch (event.type) {
      case 'start':
        console.log('Execution started');
        break;
      case 'tool-call':
        console.log('Calling tool:', event.toolCall?.function.name);
        break;
      case 'tool-result':
        console.log('Tool result:', event.toolResult);
        break;
      case 'text-complete':
        console.log('Response:', event.text);
        break;
      case 'finish':
        console.log('Usage:', event.usage);
        break;
      case 'error':
        console.error('Error:', event.error);
        break;
    }
  }
});
```

**Example - Multi-Turn Conversation**:
```typescript
// First turn
const result1 = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Hello, my name is Alice',
  provider: openAIProvider
});

// Second turn - include conversation history
const result2 = await AgentExecutor.execute({
  agent: myAgent,
  input: [
    ...result1.messages,
    { role: 'user', content: 'What\'s my name?' }
  ],
  provider: openAIProvider
});

console.log(result2.text); // Should reference "Alice"
```

**Example - Temperature and Token Overrides**:
```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Write a creative story',
  provider: openAIProvider,
  temperature: 0.9,    // Higher creativity
  maxTokens: 500      // Limit response length
});
```

---

### `executeStream()`

Executes an agent with streaming enabled, yielding response chunks in real-time.

**Signature**:
```typescript
static async executeStream(options: ExecuteOptions): Promise<ExecutionStream>
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `ExecuteOptions` | Yes | Execution configuration (streaming enabled) |

**Returns**: `Promise<ExecutionStream>`

```typescript
interface ExecutionStream {
  textStream: AsyncIterable<string>;       // Text chunks only
  fullStream: AsyncIterable<ExecutionEvent>; // All events
  finalResult: Promise<ExecutionResult>;    // Complete result when done
}
```

**Example - Basic Streaming**:
```typescript
const stream = await AgentExecutor.executeStream({
  agent: myAgent,
  input: 'Tell me a story',
  provider: openAIProvider,
  streaming: true
});

// Stream text only
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}

// Or handle all events
for await (const event of stream.fullStream) {
  if (event.type === 'text-delta') {
    process.stdout.write(event.textDelta || '');
  } else if (event.type === 'tool-call') {
    console.log('\n[Calling tool:', event.toolCall?.function.name, ']');
  }
}
```

**Example - React Component**:
```typescript
import { useState, useEffect } from 'react';

function ChatMessage({ message }) {
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      const stream = await AgentExecutor.executeStream({
        agent,
        input: message,
        provider,
        streaming: true
      });

      for await (const chunk of stream.textStream) {
        setText(prev => prev + chunk);
      }
    })();
  }, [message]);

  return <div>{text}</div>;
}
```

**Example - Express Server**:
```typescript
app.post('/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  const stream = await AgentExecutor.executeStream({
    agent: myAgent,
    input: req.body.message,
    provider: openAIProvider,
    streaming: true
  });

  for await (const event of stream.fullStream) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  res.end();
});
```

## Types

### ExecutionEvent

Events emitted during execution for monitoring and debugging.

```typescript
interface ExecutionEvent {
  type: ExecutionEventType;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  textDelta?: string;         // For 'text-delta' events
  text?: string;              // For 'text-complete' events
  toolCall?: ToolCall;        // For 'tool-call' events
  toolResult?: {              // For 'tool-result' events
    toolCallId: string;
    toolName: string;
    result: any;
    error?: string;
  };
  finishReason?: string;      // For 'finish' events
  usage?: {                   // For 'finish' events
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: Error;              // For 'error' events
}

type ExecutionEventType =
  | 'start'           // Execution beginning
  | 'text-delta'      // Streaming text chunk
  | 'text-complete'   // Complete text response
  | 'tool-call'       // Tool being called
  | 'tool-result'     // Tool result received
  | 'finish'          // Execution complete
  | 'error';          // Error occurred
```

### Message

Standard message format for conversation history.

```typescript
interface Message {
  role: MessageRole;           // Message role
  content: string;             // Message content
  name?: string;              // Tool name (for tool messages)
  toolCallId?: string;        // Tool call ID (for tool messages)
  toolCalls?: ToolCall[];     // Tool calls (for assistant messages)
}

type MessageRole = 'system' | 'user' | 'assistant' | 'tool';
```

### ToolCall

Represents an LLM's request to call a tool.

```typescript
interface ToolCall {
  id: string;                 // Unique call identifier
  type: 'function';           // Always 'function'
  function: {
    name: string;             // Tool name
    arguments: string;        // JSON string of arguments
  };
}
```

## Execution Behavior

### Message Building

The executor builds the message array sent to the LLM:

1. **System Message**: If `agent.prompt` is set, it's added as the first message
2. **Input Messages**: 
   - If `input` is a string, it's converted to a user message
   - If `input` is a `Message[]`, it's appended as-is
3. **Tool Results**: During tool calling, tool results are appended

**Example Message Flow**:
```
[
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'What is the weather?' },
  { role: 'assistant', content: '', toolCalls: [{...}] },
  { role: 'tool', content: '{"temp": 72}', name: 'weather', toolCallId: '...' },
  { role: 'assistant', content: 'The temperature is 72°F' }
]
```

### Tool Calling Loop

When tools are available and the LLM makes tool calls:

1. LLM generates response with `toolCalls`
2. Executor calls each tool via `ToolRegistry`
3. Tool results added to message history
4. LLM called again with updated history
5. Repeat until no more tool calls (or `maxSteps` reached)

**Diagram**:
```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────────┐
│ Call LLM    │
└────┬────────┘
     │
     ▼
┌─────────────────┐      No      ┌────────┐
│ Tool calls?     ├─────────────►│ Return │
└────┬────────────┘               └────────┘
     │ Yes
     ▼
┌─────────────────┐
│ Execute tools   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐      No      ┌────────┐
│ Steps < max?    ├─────────────►│ Error  │
└────┬────────────┘               └────────┘
     │ Yes
     └─────────────► (Loop back to Call LLM)
```

### Token Usage Accumulation

Token usage is accumulated across all LLM calls in a single execution:

```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Complex task requiring multiple tools',
  provider: openAIProvider,
  toolRegistry: tools
});

// result.usage includes tokens from:
// - Initial LLM call
// - All subsequent tool-calling iterations
console.log('Total tokens:', result.usage.totalTokens);
console.log('Iterations:', result.steps);
```

## Configuration Options

### maxSteps

Limits the number of tool-calling iterations to prevent infinite loops.

**Default**: `10`

**Example**:
```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Task that might need many tool calls',
  provider: openAIProvider,
  toolRegistry: tools,
  maxSteps: 5  // Limit to 5 iterations
});
```

**When to adjust**:
- Increase for complex, multi-step tasks
- Decrease for simple queries to save costs
- Monitor `result.steps` to tune appropriately

### temperature

Controls randomness in LLM responses (0.0 = deterministic, 1.0 = creative).

**Default**: Uses provider default or agent settings

**Example**:
```typescript
// Creative writing
const creative = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Write a poem',
  provider: openAIProvider,
  temperature: 0.9
});

// Factual responses
const factual = await AgentExecutor.execute({
  agent: myAgent,
  input: 'What is 2+2?',
  provider: openAIProvider,
  temperature: 0.1
});
```

### maxTokens

Limits the maximum number of tokens in the LLM response.

**Default**: Provider default (typically 4096-8192)

**Example**:
```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Summarize this article',
  provider: openAIProvider,
  maxTokens: 500  // Limit to ~375 words
});
```

## Error Handling

### Provider Errors

```typescript
try {
  const result = await AgentExecutor.execute({
    agent: myAgent,
    input: 'Hello',
    provider: openAIProvider
  });
} catch (error) {
  if (error.code === 'insufficient_quota') {
    console.error('API quota exceeded');
  } else if (error.code === 'invalid_api_key') {
    console.error('Invalid API key');
  } else {
    console.error('Execution failed:', error.message);
  }
}
```

### Tool Execution Errors

```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Use tool that might fail',
  provider: openAIProvider,
  toolRegistry: tools,
  onEvent: (event) => {
    if (event.type === 'tool-result' && event.toolResult?.error) {
      console.error('Tool error:', event.toolResult.error);
      // Tool errors are returned to LLM as context
    }
  }
});
```

**Note**: Tool errors are non-fatal. The error message is sent back to the LLM, which can respond appropriately or try again.

### Max Steps Exceeded

```typescript
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Complex task',
  provider: openAIProvider,
  toolRegistry: tools,
  maxSteps: 3
});

if (result.steps >= 3 && result.finishReason !== 'stop') {
  console.warn('Hit max steps limit, may be incomplete');
}
```

## Performance Considerations

### Parallel Tool Execution

Currently, tools are executed sequentially. For independent tool calls:

```typescript
// Sequential (current behavior)
const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Query multiple sources',
  provider: openAIProvider,
  toolRegistry: tools
});

// For parallel execution, implement in your tool:
const parallelTool = {
  displayName: 'Parallel Fetcher',
  tool: {
    execute: async (params) => {
      const results = await Promise.all([
        fetch(url1),
        fetch(url2),
        fetch(url3)
      ]);
      return results;
    }
  }
};
```

### Caching

Implement caching in your LLM provider for repeated queries:

```typescript
class CachedProvider implements LLMProvider {
  private cache = new Map();

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const key = this.getCacheKey(options);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = await this.underlyingProvider.generate(options);
    this.cache.set(key, result);
    return result;
  }

  // ... other methods
}
```

### Memory Management

For long conversations, limit message history:

```typescript
function truncateMessages(messages: Message[], maxMessages: number): Message[] {
  if (messages.length <= maxMessages) return messages;

  // Keep system message + recent messages
  const systemMessages = messages.filter(m => m.role === 'system');
  const otherMessages = messages.filter(m => m.role !== 'system');
  const recentMessages = otherMessages.slice(-maxMessages + systemMessages.length);

  return [...systemMessages, ...recentMessages];
}

const result = await AgentExecutor.execute({
  agent: myAgent,
  input: truncateMessages(conversationHistory, 20),
  provider: openAIProvider
});
```

## Common Patterns

### Retry with Backoff

```typescript
async function executeWithRetry(
  options: ExecuteOptions,
  maxRetries: number = 3
): Promise<ExecutionResult> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await AgentExecutor.execute(options);
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}
```

### Timeout Wrapper

```typescript
async function executeWithTimeout(
  options: ExecuteOptions,
  timeoutMs: number
): Promise<ExecutionResult> {
  return Promise.race([
    AgentExecutor.execute(options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Execution timeout')), timeoutMs)
    )
  ]);
}
```

### Cost Tracking

```typescript
class CostTracker {
  private totalCost = 0;

  async execute(options: ExecuteOptions): Promise<ExecutionResult> {
    const result = await AgentExecutor.execute(options);

    // Example pricing (adjust for your provider)
    const promptCost = result.usage.promptTokens * 0.00003;
    const completionCost = result.usage.completionTokens * 0.00006;
    const cost = promptCost + completionCost;

    this.totalCost += cost;
    console.log(`Execution cost: $${cost.toFixed(4)}`);
    console.log(`Total cost: $${this.totalCost.toFixed(4)}`);

    return result;
  }
}
```

## Testing

### Mock Provider

```typescript
import { MockProvider } from '@tajwal/build-ai-agent';

const mockProvider = new MockProvider({
  responses: {
    'Hello': 'Hi there!',
    '*': 'Default response'
  }
});

const result = await AgentExecutor.execute({
  agent: myAgent,
  input: 'Hello',
  provider: mockProvider
});

expect(result.text).toBe('Hi there!');
```

### Event Capture for Testing

```typescript
const events: ExecutionEvent[] = [];

await AgentExecutor.execute({
  agent: myAgent,
  input: 'Test input',
  provider: mockProvider,
  onEvent: (event) => events.push(event)
});

expect(events).toContainEqual(
  expect.objectContaining({ type: 'start' })
);
expect(events).toContainEqual(
  expect.objectContaining({ type: 'finish' })
);
```

## See Also

- [AgentBuilder](./agent-builder) - Building agent configurations
- LLMProvider - LLM provider interface
- ToolRegistry - Tool management
- Tutorial: Streaming Responses
- Guide: Error Handling

---

**Last Updated**: January 2025 | **SDK Version**: 1.0.0-alpha.8

*Found an issue? [Report it](https://github.com/tajwal/build-ai-agent/issues/new)*
