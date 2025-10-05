---
sidebar_position: 1
---

# Simple Chatbot

Build a conversational chatbot with memory and context awareness.

## Overview

This example demonstrates how to create a basic chatbot that:
- Responds to user messages
- Maintains conversation history
- Uses OpenAI GPT models
- Handles errors gracefully

## Complete Code

```typescript title="chatbot.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider,
  createMockRepositories,
  AgentType 
} from '@tajwal/build-ai-agent';

async function main() {
  // Create chatbot agent
  const agent = new AgentBuilder()
    .setType(AgentType.Chatbot)
    .setName('Friendly Chatbot')
    .setPrompt(`You are a friendly and helpful chatbot assistant.
    - Be conversational and warm
    - Remember context from previous messages
    - Ask clarifying questions when needed
    - Provide helpful and accurate information`)
    .setDescription('A friendly chatbot for general conversations')
    .build();

  // Setup repositories (use database in production)
  const repositories = createMockRepositories();

  // Configure OpenAI provider
  const llmProvider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7
  });

  // Create executor
  const executor = new AgentExecutor({
    agent,
    sessionId: 'user-session-123',
    repositories,
    llmProvider
  });

  // Simulate conversation
  console.log('🤖 Chatbot: Hello! I\'m your friendly assistant. How can I help you today?\n');

  // User message 1
  const response1 = await executor.execute({
    messages: [
      { role: 'user', content: 'Hi! Can you tell me about TypeScript?' }
    ]
  });
  console.log('👤 User: Hi! Can you tell me about TypeScript?');
  console.log('🤖 Chatbot:', response1.response, '\n');

  // User message 2 (with context)
  const response2 = await executor.execute({
    messages: [
      { role: 'user', content: 'What are its main benefits?' }
    ]
  });
  console.log('👤 User: What are its main benefits?');
  console.log('🤖 Chatbot:', response2.response, '\n');

  // User message 3
  const response3 = await executor.execute({
    messages: [
      { role: 'user', content: 'Can you show me a simple example?' }
    ]
  });
  console.log('👤 User: Can you show me a simple example?');
  console.log('🤖 Chatbot:', response3.response, '\n');

  console.log('✅ Conversation completed successfully!');
}

// Run with error handling
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
```

## Running the Example

### Step 1: Setup

Install dependencies:

```bash npm2yarn
npm install @tajwal/build-ai-agent ai zod @ai-sdk/openai
```

### Step 2: Configure Environment

Create a `.env` file:

```bash title=".env"
OPENAI_API_KEY=your-api-key-here
```

### Step 3: Run

```bash
npx tsx chatbot.ts
```

## Expected Output

```
🤖 Chatbot: Hello! I'm your friendly assistant. How can I help you today?

👤 User: Hi! Can you tell me about TypeScript?
🤖 Chatbot: TypeScript is a strongly typed programming language that builds on JavaScript...

👤 User: What are its main benefits?
🤖 Chatbot: The main benefits of TypeScript include: type safety, better tooling...

👤 User: Can you show me a simple example?
🤖 Chatbot: Here's a simple TypeScript example...

✅ Conversation completed successfully!
```

## Interactive Version

Create an interactive CLI chatbot:

```typescript title="interactive-chatbot.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider,
  createMockRepositories 
} from '@tajwal/build-ai-agent';
import * as readline from 'readline';

async function interactiveChatbot() {
  // Setup agent
  const agent = new AgentBuilder()
    .setType('chatbot')
    .setName('Interactive Bot')
    .setPrompt('You are a helpful assistant.')
    .build();

  const executor = new AgentExecutor({
    agent,
    sessionId: `session-${Date.now()}`,
    repositories: createMockRepositories(),
    llmProvider: new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY!
    })
  });

  // Setup readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🤖 Chatbot ready! Type your message (or "exit" to quit)\n');

  // Chat loop
  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }

      try {
        const result = await executor.execute({
          messages: [{ role: 'user', content: input }]
        });
        console.log('🤖 Bot:', result.response, '\n');
      } catch (error) {
        console.error('Error:', error.message);
      }

      askQuestion();
    });
  };

  askQuestion();
}

interactiveChatbot();
```

## Streaming Version

For real-time responses:

```typescript title="streaming-chatbot.ts"
import { 
  AgentBuilder, 
  AgentExecutor, 
  OpenAIProvider,
  createMockRepositories 
} from '@tajwal/build-ai-agent';

async function streamingChatbot() {
  const agent = new AgentBuilder()
    .setType('chatbot')
    .setName('Streaming Bot')
    .setPrompt('You are a helpful assistant.')
    .enableStreaming(true)
    .build();

  const executor = new AgentExecutor({
    agent,
    sessionId: 'stream-session',
    repositories: createMockRepositories(),
    llmProvider: new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY!
    })
  });

  console.log('👤 User: Tell me a story about AI\n');
  console.log('🤖 Bot: ');

  // Stream response
  const stream = await executor.executeStream({
    messages: [
      { role: 'user', content: 'Tell me a story about AI' }
    ]
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }

  console.log('\n\n✅ Story complete!');
}

streamingChatbot();
```

## Adding Memory

Configure conversation memory:

```typescript
const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('Memory Bot')
  .setPrompt('You are a helpful assistant.')
  .setMemoryConfig({
    maxMessages: 20,        // Keep last 20 messages
    summarizeAfter: 50,     // Summarize after 50 messages
    vectorStoreEnabled: true // Enable semantic search
  })
  .build();
```

## Error Handling

Robust error handling:

```typescript
async function chatWithErrorHandling(userMessage: string) {
  try {
    const result = await executor.execute({
      messages: [{ role: 'user', content: userMessage }]
    });
    return result.response;
  } catch (error) {
    // Handle different error types
    if (error.code === 'RATE_LIMIT') {
      return 'I\'m receiving too many requests. Please try again in a moment.';
    } else if (error.code === 'INVALID_API_KEY') {
      console.error('Invalid API key. Please check your configuration.');
      process.exit(1);
    } else if (error.code === 'TIMEOUT') {
      return 'Sorry, the request took too long. Please try again.';
    } else {
      console.error('Unexpected error:', error);
      return 'Sorry, something went wrong. Please try again.';
    }
  }
}
```

## Production Setup

For production, use a real database:

```typescript
import { createDrizzleRepositories } from '@tajwal/build-ai-agent-drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Setup database connection
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Use Drizzle repositories
const repositories = createDrizzleRepositories(db);

const executor = new AgentExecutor({
  agent,
  sessionId: userId, // Use actual user ID
  repositories,      // Production repositories
  llmProvider
});
```

## Customization

### Personality Customization

```typescript
const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('Friendly Bot')
  .setPrompt(`You are a cheerful and enthusiastic assistant!
  - Use emojis occasionally 😊
  - Be encouraging and positive
  - Show genuine interest in helping
  - Keep responses concise but warm`)
  .build();
```

### Language Support

```typescript
const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('Multilingual Bot')
  .setPrompt(`You are a multilingual assistant.
  - Detect the user's language automatically
  - Respond in the same language
  - Support English, Spanish, French, German, and more`)
  .build();
```

## Next Steps

- Add Tools for extended capabilities
- Implement Workflows for complex tasks
- Learn about Data Analysis agents
- Explore Customer Support bots
