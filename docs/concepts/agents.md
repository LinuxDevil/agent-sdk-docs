---
sidebar_position: 1
---

# Agents

Agents are the core abstraction in the Build AI Agent SDK. They combine AI capabilities with tools, workflows, and memory to accomplish tasks.

## What is an Agent?

An agent is an autonomous entity that:
- Receives user input
- Processes it using an LLM
- Can use tools to accomplish tasks
- Maintains conversation context
- Returns responses

## Agent Types

The SDK provides several pre-configured agent types:

### Chatbot
Basic conversational agent for Q&A and general assistance.

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.Chatbot)
  .setName('Support Bot')
  .setPrompt('You are a helpful customer support assistant.')
  .build();
```

### Smart Assistant
Advanced agent that can use tools and make decisions.

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('AI Assistant')
  .setPrompt('You are an intelligent assistant with access to various tools.')
  .addTool('web-search', { tool: 'webSearch' })
  .addTool('calculator', { tool: 'calculator' })
  .build();
```

### Workflow
Agent that follows predefined workflows and processes.

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.Workflow)
  .setName('Order Processor')
  .setPrompt('You process customer orders following the workflow.')
  .setFlowId('order-processing-flow')
  .build();
```

### Data Analyst
Specialized agent for data analysis tasks.

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.DataAnalyst)
  .setName('Data Analyst')
  .setPrompt('You analyze data and provide insights.')
  .addTool('sql-query', { tool: 'sqlQuery' })
  .addTool('chart-generator', { tool: 'chartGenerator' })
  .build();
```

### Code Assistant
Agent specialized for coding tasks.

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.CodeAssistant)
  .setName('Code Helper')
  .setPrompt('You help developers write and debug code.')
  .addTool('code-search', { tool: 'codeSearch' })
  .addTool('code-executor', { tool: 'codeExecutor' })
  .build();
```

## Agent Configuration

### Basic Configuration

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('My Agent')
  .setPrompt('You are a helpful assistant.')
  .setDescription('An agent that helps users with various tasks')
  .build();
```

### Advanced Configuration

```typescript
const agent = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('Advanced Agent')
  .setPrompt('You are an intelligent assistant.')
  
  // Add tools
  .addTool('weather', {
    tool: 'weatherTool',
    options: { units: 'celsius' }
  })
  .addTool('calculator', { tool: 'calculator' })
  
  // Set memory options
  .setMemoryConfig({
    maxMessages: 20,
    summarizeAfter: 50
  })
  
  // Set model preferences
  .setModelConfig({
    temperature: 0.7,
    maxTokens: 2000
  })
  
  // Enable features
  .enableStreaming(true)
  .enableToolCalling(true)
  
  .build();
```

## Agent Properties

### Core Properties

- **id**: Unique identifier for the agent
- **name**: Human-readable name
- **type**: Agent type (Chatbot, SmartAssistant, etc.)
- **prompt**: System prompt that defines agent behavior
- **description**: Optional description of agent capabilities

### Tool Configuration

- **tools**: Array of tools available to the agent
- **toolOptions**: Configuration options for each tool

### Flow Configuration

- **flowId**: ID of the workflow the agent follows
- **flowData**: Additional data for flow execution

### Memory Configuration

- **maxMessages**: Maximum messages to keep in context
- **summarizeAfter**: Summarize context after N messages
- **vectorStoreEnabled**: Enable semantic search over history

### Model Configuration

- **temperature**: Control randomness (0-1)
- **maxTokens**: Maximum response length
- **topP**: Nucleus sampling parameter
- **frequencyPenalty**: Reduce repetition
- **presencePenalty**: Encourage topic diversity

## Agent Lifecycle

```typescript
// 1. Create agent
const agent = new AgentBuilder()
  .setType('chatbot')
  .setName('My Agent')
  .setPrompt('You are helpful.')
  .build();

// 2. Create executor
const executor = new AgentExecutor({
  agent,
  sessionId: 'session-123',
  repositories,
  llmProvider
});

// 3. Execute conversations
const result = await executor.execute({
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

// 4. Access conversation history
const history = await repositories.messages.findBySession('session-123');

// 5. Update agent (optional)
const updatedAgent = new AgentBuilder(agent)
  .setPrompt('Updated prompt')
  .build();
```

## Agent Persistence

Agents can be saved and loaded from a database:

```typescript
// Save agent
await repositories.agents.create({
  id: agent.id,
  name: agent.name,
  type: agent.type,
  prompt: agent.prompt,
  configuration: agent
});

// Load agent
const savedAgent = await repositories.agents.findById(agent.id);

// Restore agent
const restoredAgent = new AgentBuilder()
  .fromConfiguration(savedAgent.configuration)
  .build();
```

## Best Practices

### 1. Clear and Specific Prompts

```typescript
// ❌ Too vague
.setPrompt('You are helpful.')

// ✅ Clear and specific
.setPrompt(`You are a customer support agent for Acme Corp.
- Be friendly and professional
- Help with orders, returns, and product questions
- Escalate technical issues to engineering
- Always ask for order number when relevant`)
```

### 2. Appropriate Tools

```typescript
// ✅ Only include relevant tools
const agent = new AgentBuilder()
  .setType('smart-assistant')
  .setPrompt('You help with travel planning.')
  .addTool('weather', { tool: 'weather' })
  .addTool('flight-search', { tool: 'flightSearch' })
  // Don't add calculator, code executor, etc.
  .build();
```

### 3. Memory Management

```typescript
// ✅ Configure appropriate memory limits
.setMemoryConfig({
  maxMessages: 50,        // Keep recent context
  summarizeAfter: 100,    // Summarize when growing
  vectorStoreEnabled: true // Enable semantic search
})
```

### 4. Error Handling

```typescript
try {
  const result = await executor.execute({
    messages: [{ role: 'user', content: input }]
  });
  return result.response;
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    return 'I\'m experiencing high demand. Please try again in a moment.';
  }
  throw error;
}
```

## Next Steps

- Learn about [Tools](./tools) to extend agent capabilities
- Explore Flows for structured workflows
- Configure Providers for different LLMs
- Understand Memory management
