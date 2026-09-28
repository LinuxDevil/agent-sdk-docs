---
sidebar_position: 1
---

# Agents

Agents are the core abstraction in the Build AI Agent SDK. They combine an LLM with a prompt, tools, and execution options to accomplish tasks.

## What is an Agent?

An agent is a configuration (an `AgentConfig`) plus an execution runtime that:

- Receives user input
- Processes it using an LLM
- Can call tools to accomplish tasks, some gated behind human approval or a sandbox
- Maintains conversation context
- Returns a response

There are two ways to build one: the zero-config `createAgent()` function, or `AgentBuilder` + the static `AgentExecutor.execute()` when you need full control. A third way - declarative `AgentSpec` files - is covered in [Declarative Specs](./declarative-specs).

## The zero-config path: `createAgent()`

```typescript
import { createAgent, resolveProvider } from '@loushy/build-ai-agent';

const agent = createAgent({
  prompt: 'You are a helpful customer support assistant.',
  provider: resolveProvider('openai/gpt-4o-mini'), // reads OPENAI_API_KEY
});

const result = await agent.send('Hello!');
console.log(result.text);
```

`createAgent()` takes a `prompt` and `provider` (both required), plus optional `name`, `tools` (a `Record<string, ToolDescriptor>`), and `maxSteps`. It builds the `AgentConfig` and tool registry for you and hands back a `{ send(message) }` agent - internally, `send()` calls `AgentBuilder` + `AgentExecutor.execute()`.

Use `createMockProvider(...)` instead of `resolveProvider(...)` to run without any API key - this is what every snippet on this page and the [Quick Start](../quick-start) use by default.

## Full control: `AgentBuilder` + `AgentExecutor`

When you need `maxSteps`, approval gates, checkpoints, tracing hooks, delegation, or a `ToolRegistry` with several tools wired in, build the agent with `AgentBuilder` and run it with the **static** `AgentExecutor.execute()` - there is no `new AgentExecutor()`.

```typescript
import { AgentBuilder, AgentExecutor, AgentType, createMockProvider } from '@loushy/build-ai-agent';

const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setName('Customer Support Agent')
  .setPrompt('You are a helpful customer support assistant.')
  .build();

const result = await AgentExecutor.execute({
  agent,
  input: 'My order arrived damaged.',
  provider: createMockProvider({ responses: ["I'm sorry to hear that - what's your order number?"] }),
  maxSteps: 5,
});

console.log(result.text);
console.log(result.usage.totalTokens, result.finishReason, result.steps);
```

`AgentExecutor.execute()`'s full option set - `toolRegistry`, `temperature`/`maxTokens`, `onEvent`, `approvalStore`/`sessionId`, `checkpointStore`, `exporter`, `sandbox`, `onLLMRequest`/`onLLMResponse`/`onToolCall`/`onToolResult` - is documented in [`api/agent-executor`](../api/agent-executor).

## Agent Types

`AgentType` is a small enum describing the agent's fundamental shape:

```typescript
enum AgentType {
  SmartAssistant = 'smart-assistant', // general-purpose, tool-calling agent
  SurveyAgent = 'survey-agent',       // conducting surveys
  CommerceAgent = 'commerce-agent',   // e-commerce interactions
  Flow = 'flow',                      // workflow-based agent following a Flow
}
```

```typescript
const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setName('AI Assistant')
  .setPrompt('You are an intelligent assistant with access to various tools.')
  .addTool('current_date', { tool: 'current-date' })
  .build();
```

## Agent Configuration

`AgentBuilder`'s fluent setters cover the full `AgentConfig` shape:

```typescript
const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setName('Product Recommendation Agent')
  .setPrompt('You are a product recommendation specialist.')
  .addTool('search', { tool: 'productSearch' })
  .setLocale('en')
  .setSettings({ temperature: 0.7, maxTokens: 1500 })
  .setMetadata({ version: '1.0.0', department: 'sales' })
  .build();
```

See the full method-by-method reference in [`api/agent-builder`](../api/agent-builder).

## Agent Properties

### Core Properties

- **id**: Unique identifier for the agent (auto-generated with `nanoid` if not set)
- **name**: Human-readable name
- **agentType**: `AgentType` (`SmartAssistant`, `SurveyAgent`, `CommerceAgent`, `Flow`)
- **prompt**: System prompt that defines agent behavior
- **locale**: BCP 47 language tag, defaults to `'en'`

### Tool Configuration

- **tools**: `Record<string, ToolConfiguration>` referencing tools registered in a `ToolRegistry`

### Flow Configuration

- **flows**: `AgentFlow[]` for structured, multi-step workflows (see Flows in the SDK README)

### Settings & Metadata

- **settings**: Arbitrary settings object (e.g. `temperature`, `maxTokens` defaults for your own use)
- **metadata**: Arbitrary metadata for categorization, versioning, etc.

## Agent Lifecycle

```typescript
// 1. Build the agent config
const agent = AgentBuilder.create()
  .setType(AgentType.SmartAssistant)
  .setName('My Agent')
  .setPrompt('You are helpful.')
  .build();

// 2. Execute a turn
const result = await AgentExecutor.execute({
  agent,
  input: 'Hello!',
  provider,
});

// 3. Continue the conversation - feed the prior messages back in
const result2 = await AgentExecutor.execute({
  agent,
  input: [...result.messages, { role: 'user', content: 'What did I just say?' }],
  provider,
});

// 4. Update an agent's config by re-building from it
const updatedAgent = AgentBuilder.from(agent)
  .setPrompt('Updated prompt')
  .build();
```

For conversations that must survive a crash or process restart, pass a `sessionId` and `checkpointStore` instead of threading `messages` by hand - see [Human-in-the-Loop](./human-in-the-loop).

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

Only register tools the agent's prompt actually tells it to use - an unused tool is wasted context (and attack surface).

### 3. Gate sensitive tools

Flag any tool with a real-world side effect (sending an email, opening a PR, spending money) `needsApproval`, and flag anything that shells out or touches the filesystem `requiresSandbox`. See [Tools](./tools) and [Guardrails & Safety](./guardrails-and-safety).

### 4. Error Handling

```typescript
try {
  const result = await AgentExecutor.execute({ agent, input, provider });
  return result.text;
} catch (error) {
  console.error('Execution failed:', error);
  return "I'm experiencing an issue. Please try again in a moment.";
}
```

## Next Steps

- Learn about [Tools](./tools) to extend agent capabilities
- [Human-in-the-Loop](./human-in-the-loop) - approval gates and durable checkpoints
- [Delegation](./delegation) - multi-agent systems
- [Declarative Specs](./declarative-specs) - describing an agent as a YAML/JSON file
