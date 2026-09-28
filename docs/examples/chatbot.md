---
sidebar_position: 1
---

# Simple Chatbot

Build a conversational chatbot that maintains context across turns.

## Overview

This example demonstrates how to create a basic chatbot that:

- Responds to user messages
- Maintains conversation history across turns
- Uses a real provider (or the free built-in mock provider)
- Handles errors gracefully

## Complete Code

```typescript title="chatbot.ts"
import { createAgent, resolveProvider, createMockProvider } from '@loushy/build-ai-agent';
import type { Message } from '@loushy/build-ai-agent';

async function main() {
  const provider = process.env.OPENAI_API_KEY
    ? resolveProvider('openai/gpt-4o-mini')
    : createMockProvider({
        responses: [
          'TypeScript is a strongly typed superset of JavaScript that compiles to plain JS...',
          'Its main benefits are type safety, better tooling, and easier refactoring.',
          "Here's a simple example: `const greet = (name: string): string => `Hello, ${name}`;`",
        ],
      });

  const agent = createAgent({
    name: 'Friendly Chatbot',
    prompt: `You are a friendly and helpful chatbot assistant.
    - Be conversational and warm
    - Remember context from previous messages
    - Ask clarifying questions when needed
    - Provide helpful and accurate information`,
    provider,
  });

  console.log("🤖 Chatbot: Hello! I'm your friendly assistant. How can I help you today?\n");

  // createAgent()'s agent.send() only remembers one turn at a time - thread
  // the conversation yourself by feeding prior messages back in via
  // AgentExecutor.execute()'s `input: Message[]` form for real multi-turn
  // memory (see "Multi-turn conversations" below).
  const response1 = await agent.send('Hi! Can you tell me about TypeScript?');
  console.log('👤 User: Hi! Can you tell me about TypeScript?');
  console.log('🤖 Chatbot:', response1.text, '\n');

  console.log('✅ Conversation completed successfully!');
}

main().catch((error) => {
  console.error('❌ Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
```

## Running the Example

### Step 1: Setup

```bash npm2yarn
npm install @loushy/build-ai-agent ai zod @ai-sdk/openai
```

### Step 2: Configure Environment

```bash title=".env"
OPENAI_API_KEY=your-api-key-here
```

Unset (or omit) `OPENAI_API_KEY` and the example above falls back to the mock provider - no key needed to try it.

### Step 3: Run

```bash
npx tsx chatbot.ts
```

## Multi-turn conversations

`createAgent()`'s `{ send }` agent is a thin wrapper for the single-turn case. For a conversation that remembers earlier turns, use `AgentBuilder` + `AgentExecutor.execute()` directly and feed the previous result's `messages` back in as the next call's `input`:

```typescript title="multi-turn-chatbot.ts"
import { AgentBuilder, AgentExecutor, AgentType, resolveProvider } from '@loushy/build-ai-agent';

const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setName('Chatbot')
  .setPrompt('You are a helpful assistant. Remember what the user told you.')
  .build();

const provider = resolveProvider('openai/gpt-4o-mini');

const turn1 = await AgentExecutor.execute({
  agent,
  input: "Hi, I'm Alice.",
  provider,
});

const turn2 = await AgentExecutor.execute({
  agent,
  input: [...turn1.messages, { role: 'user', content: "What's my name?" }],
  provider,
});

console.log(turn2.text); // should reference "Alice"
```

## Durable, restart-safe conversations

For a chatbot that needs to survive a server restart mid-conversation, pass a `sessionId` and a `checkpointStore` instead of manually threading `messages` - see [Human-in-the-Loop](../concepts/human-in-the-loop#durable-execution-checkpoints).

## Interactive CLI version

```typescript title="interactive-chatbot.ts"
import { createAgent, resolveProvider } from '@loushy/build-ai-agent';
import * as readline from 'readline';

async function interactiveChatbot() {
  const agent = createAgent({
    prompt: 'You are a helpful assistant.',
    provider: resolveProvider('openai/gpt-4o-mini'),
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('🤖 Chatbot ready! Type your message (or "exit" to quit)\n');

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }

      try {
        const result = await agent.send(input);
        console.log('🤖 Bot:', result.text, '\n');
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

interactiveChatbot();
```

## Error Handling

```typescript
async function chatWithErrorHandling(agent: ReturnType<typeof createAgent>, userMessage: string) {
  try {
    const result = await agent.send(userMessage);
    return result.text;
  } catch (error) {
    console.error('Unexpected error:', error);
    return 'Sorry, something went wrong. Please try again.';
  }
}
```

## Personality customization

```typescript
const agent = createAgent({
  name: 'Friendly Bot',
  prompt: `You are a cheerful and enthusiastic assistant!
  - Use emojis occasionally 😊
  - Be encouraging and positive
  - Show genuine interest in helping
  - Keep responses concise but warm`,
  provider,
});
```

## Next Steps

- [Tools](../concepts/tools) - give the chatbot capabilities beyond chatting
- [Human-in-the-Loop](../concepts/human-in-the-loop) - pause for approval, durable checkpoints
- [Examples gallery](./gallery) - real runnable examples, including the flagship ops-pipeline demo
