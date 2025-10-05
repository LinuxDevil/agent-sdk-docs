---
sidebar_position: 2
---

# Tools

Tools extend agent capabilities by allowing them to interact with external systems, perform calculations, fetch data, and more.

## What are Tools?

Tools are functions that agents can call to:
- Fetch external data (APIs, databases)
- Perform calculations or transformations
- Execute actions (send emails, update records)
- Access services (search engines, file systems)

## Built-in Tools

The SDK includes several ready-to-use tools:

### HTTP Request Tool

Make HTTP requests to external APIs:

```typescript
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .addTool('http', {
    tool: 'httpRequest',
    options: {
      method: 'GET',
      baseUrl: 'https://api.example.com'
    }
  })
  .build();
```

### Calculator Tool

Perform mathematical calculations:

```typescript
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .addTool('calculator', {
    tool: 'calculator'
  })
  .build();
```

### File Operations Tool

Read and write files:

```typescript
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .addTool('file-ops', {
    tool: 'fileOperations',
    options: {
      allowedPaths: ['/data']
    }
  })
  .build();
```

### Database Query Tool

Execute database queries:

```typescript
const agent = new AgentBuilder()
  .setType('data-analyst')
  .addTool('db-query', {
    tool: 'databaseQuery',
    options: {
      connectionString: process.env.DB_URL,
      allowedOperations: ['SELECT']
    }
  })
  .build();
```

## Creating Custom Tools

Create your own tools with the ToolRegistry:

### Simple Custom Tool

```typescript
import { ToolRegistry } from '@tajwal/build-ai-agent';
import { z } from 'zod';

const registry = new ToolRegistry();

registry.register({
  name: 'weather',
  description: 'Get current weather for a location',
  parameters: z.object({
    location: z.string().describe('City name or zip code'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  execute: async ({ location, units }) => {
    const response = await fetch(
      `https://api.weather.com/v1/current?location=${location}&units=${units}`
    );
    const data = await response.json();
    
    return {
      temperature: data.temp,
      conditions: data.conditions,
      humidity: data.humidity
    };
  }
});
```

### Tool with Error Handling

```typescript
registry.register({
  name: 'stock-price',
  description: 'Get current stock price',
  parameters: z.object({
    symbol: z.string().describe('Stock ticker symbol')
  }),
  execute: async ({ symbol }) => {
    try {
      const response = await fetch(
        `https://api.stocks.com/quote/${symbol}`
      );
      
      if (!response.ok) {
        throw new Error(`Stock not found: ${symbol}`);
      }
      
      const data = await response.json();
      
      return {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent
      };
    } catch (error) {
      return {
        error: error.message,
        symbol
      };
    }
  }
});
```

### Async Tool with Dependencies

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

registry.register({
  name: 'user-lookup',
  description: 'Find user information by email',
  parameters: z.object({
    email: z.string().email()
  }),
  execute: async ({ email }) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    return user;
  }
});
```

## Tool Configuration

### Tool Options

```typescript
const agent = new AgentBuilder()
  .addTool('my-tool', {
    tool: 'myTool',
    options: {
      timeout: 5000,        // Timeout in ms
      retries: 3,           // Number of retries
      rateLimit: 10,        // Max calls per minute
      cacheResults: true    // Cache responses
    }
  })
  .build();
```

### Tool Permissions

```typescript
const agent = new AgentBuilder()
  .addTool('database', {
    tool: 'databaseQuery',
    options: {
      permissions: {
        allowedOperations: ['SELECT'],
        allowedTables: ['users', 'orders'],
        maxRows: 1000
      }
    }
  })
  .build();
```

## Using Tools in Agents

### Single Tool

```typescript
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .setPrompt('You can check the weather. Use the weather tool when asked.')
  .addTool('weather', { tool: 'weather' })
  .build();

const result = await executor.execute({
  messages: [
    { role: 'user', content: 'What\'s the weather in London?' }
  ]
});
```

### Multiple Tools

```typescript
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .setPrompt('You have access to weather, news, and stock tools.')
  .addTool('weather', { tool: 'weather' })
  .addTool('news', { tool: 'newsSearch' })
  .addTool('stocks', { tool: 'stockPrice' })
  .build();
```

### Conditional Tool Usage

```typescript
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .setPrompt(`You have different tools available:
- Use weather tool for weather questions
- Use calculator for math questions
- Use database tool for user data queries
Always choose the most appropriate tool.`)
  .addTool('weather', { tool: 'weather' })
  .addTool('calculator', { tool: 'calculator' })
  .addTool('database', { tool: 'userLookup' })
  .build();
```

## Tool Registry

Manage tools globally:

```typescript
import { ToolRegistry } from '@tajwal/build-ai-agent';

// Create registry
const registry = new ToolRegistry();

// Register multiple tools
registry.register({
  name: 'tool1',
  description: 'First tool',
  parameters: z.object({ param: z.string() }),
  execute: async ({ param }) => ({ result: param })
});

registry.register({
  name: 'tool2',
  description: 'Second tool',
  parameters: z.object({ value: z.number() }),
  execute: async ({ value }) => ({ result: value * 2 })
});

// Get all tools
const allTools = registry.getAll();

// Get specific tool
const tool1 = registry.get('tool1');

// Check if tool exists
if (registry.has('tool1')) {
  console.log('Tool1 is registered');
}

// Use with executor
const executor = new AgentExecutor({
  agent,
  sessionId: 'session-123',
  repositories,
  llmProvider,
  toolRegistry: registry
});
```

## Tool Execution Flow

```
User Input
    ↓
Agent processes with LLM
    ↓
LLM decides to call tool
    ↓
Tool parameters extracted
    ↓
Tool executed
    ↓
Results returned to LLM
    ↓
LLM formulates response
    ↓
Response returned to user
```

## Best Practices

### 1. Clear Tool Descriptions

```typescript
// ❌ Vague
description: 'Gets data'

// ✅ Clear
description: 'Fetches current weather data including temperature, conditions, and humidity for any city worldwide'
```

### 2. Detailed Parameter Schemas

```typescript
// ✅ Well-documented parameters
parameters: z.object({
  location: z.string()
    .describe('City name (e.g., "London") or zip code (e.g., "90210")'),
  units: z.enum(['celsius', 'fahrenheit'])
    .default('celsius')
    .describe('Temperature units for the response'),
  includeForcast: z.boolean()
    .default(false)
    .describe('Include 5-day forecast in response')
})
```

### 3. Error Handling

```typescript
execute: async (params) => {
  try {
    const result = await performOperation(params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Tool execution failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
}
```

### 4. Rate Limiting

```typescript
const rateLimiter = new Map<string, number>();

execute: async (params) => {
  const now = Date.now();
  const lastCall = rateLimiter.get('toolName') || 0;
  
  if (now - lastCall < 1000) {
    return { error: 'Rate limit exceeded. Try again in 1 second.' };
  }
  
  rateLimiter.set('toolName', now);
  
  // Execute tool logic
  return await performOperation(params);
}
```

### 5. Input Validation

```typescript
execute: async ({ email, amount }) => {
  // Validate email format
  if (!email.includes('@')) {
    return { error: 'Invalid email format' };
  }
  
  // Validate amount range
  if (amount < 0 || amount > 10000) {
    return { error: 'Amount must be between 0 and 10000' };
  }
  
  // Proceed with execution
  return await processPayment(email, amount);
}
```

## Advanced Tool Patterns

### Tool Chaining

```typescript
registry.register({
  name: 'complex-operation',
  description: 'Performs a complex multi-step operation',
  parameters: z.object({ input: z.string() }),
  execute: async ({ input }) => {
    // Step 1: Process input
    const processed = await tool1.execute({ data: input });
    
    // Step 2: Transform result
    const transformed = await tool2.execute({ 
      data: processed.result 
    });
    
    // Step 3: Finalize
    const final = await tool3.execute({ 
      data: transformed.result 
    });
    
    return final;
  }
});
```

### Conditional Tool Execution

```typescript
execute: async ({ operation, data }) => {
  switch (operation) {
    case 'fetch':
      return await fetchData(data);
    case 'update':
      return await updateData(data);
    case 'delete':
      return await deleteData(data);
    default:
      return { error: 'Unknown operation' };
  }
}
```

## Next Steps

- Learn about Flows for orchestrating tool usage
- Explore Built-in Tools reference
- See Tool Examples
