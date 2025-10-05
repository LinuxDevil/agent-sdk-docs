---
sidebar_position: 1
title: AgentBuilder
description: Complete API reference for the AgentBuilder class
---

# AgentBuilder

`AgentBuilder` provides a fluent API for constructing and validating agent configurations. It implements the builder pattern, allowing you to chain method calls to configure complex agents in a type-safe manner.

## Overview

The `AgentBuilder` class is the primary way to create agent configurations. It handles validation, provides sensible defaults, and ensures configurations are complete before creating an agent.

**Import**:
```typescript
import { AgentBuilder } from '@tajwal/build-ai-agent';
// or
import { AgentBuilder } from '@tajwal/build-ai-agent/core';
```

**Basic Usage**:
```typescript
const agent = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('My Agent')
  .setPrompt('You are a helpful assistant')
  .build();
```

## Constructor

### `new AgentBuilder()`

Creates a new agent builder instance with an empty configuration.

**Signature**:
```typescript
constructor()
```

**Returns**: `AgentBuilder` instance

**Example**:
```typescript
const builder = new AgentBuilder();
```

**Note**: You can also use static factory methods `AgentBuilder.create()` or `AgentBuilder.from(config)`.

## Instance Methods

### `setType()`

Sets the agent type, which determines the agent's fundamental behavior and capabilities.

**Signature**:
```typescript
setType(type: AgentType): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `AgentType` | Yes | The agent type enum value |

**AgentType Values**:
- `AgentType.SmartAssistant` - General-purpose conversational agent with tool calling
- `AgentType.SurveyAgent` - Specialized for conducting surveys and collecting responses
- `AgentType.CommerceAgent` - Optimized for e-commerce interactions and transactions
- `AgentType.Flow` - Workflow-based agent following structured flows

**Returns**: `this` (for method chaining)

**Throws**: 
- Error during `build()` if type is not set

**Example**:
```typescript
builder.setType(AgentType.SmartAssistant);
```

**See also**: Agent Types

---

### `setName()`

Sets the human-readable name for the agent.

**Signature**:
```typescript
setName(name: string): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | The agent's display name |

**Returns**: `this` (for method chaining)

**Throws**: 
- Error during `build()` if name is not set or empty

**Example**:
```typescript
builder.setName('Customer Support Agent');
```

**Validation Rules**:
- Must not be empty
- Must be a non-whitespace string
- Recommended length: 3-50 characters

---

### `setId()`

Sets a custom identifier for the agent. If not provided, a unique ID is auto-generated using nanoid.

**Signature**:
```typescript
setId(id: string): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | No | Custom agent identifier |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.setId('support-agent-v2');
```

**Best Practices**:
- Use semantic IDs for production agents (e.g., `product-recommender-v1`)
- Let the SDK auto-generate IDs for development/testing
- IDs should be URL-safe and unique within your system

---

### `setPrompt()`

Sets the system prompt that defines the agent's behavior, personality, and capabilities.

**Signature**:
```typescript
setPrompt(prompt: string): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | `string` | No | System prompt/instructions |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.setPrompt(`You are a helpful customer support agent.

Guidelines:
- Be professional and empathetic
- Ask clarifying questions when needed
- Use tools to look up information
- Always confirm actions before executing`);
```

**Best Practices**:
- Be specific about the agent's role and capabilities
- Include guidelines for tool usage
- Specify tone and personality
- Mention any constraints or limitations
- Use clear, concise language

**See also**: Prompt Engineering Guide

---

### `addTool()`

Adds a single tool to the agent's available capabilities.

**Signature**:
```typescript
addTool(key: string, config: ToolConfiguration): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | Yes | Unique identifier for this tool in the agent |
| `config` | `ToolConfiguration` | Yes | Tool configuration object |

**ToolConfiguration Type**:
```typescript
interface ToolConfiguration {
  tool: string;              // Tool name from registry
  description?: string;      // Override tool description
  options?: Record<string, any>; // Tool-specific options
}
```

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.addTool('search', {
  tool: 'webSearch',
  description: 'Search the web for information',
  options: {
    maxResults: 5
  }
});
```

**Note**: Tools must be registered in a `ToolRegistry` before execution.

**See also**: [Tool Configuration](../concepts/tools)

---

### `removeTool()`

Removes a tool from the agent's configuration.

**Signature**:
```typescript
removeTool(key: string): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | Yes | Tool key to remove |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.removeTool('search');
```

---

### `setTools()`

Replaces all tools with a new set.

**Signature**:
```typescript
setTools(tools: Record<string, ToolConfiguration>): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `tools` | `Record<string, ToolConfiguration>` | Yes | Complete tools configuration |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.setTools({
  search: { tool: 'webSearch' },
  calculator: { tool: 'calculator' },
  weather: { 
    tool: 'weatherAPI',
    options: { units: 'celsius' }
  }
});
```

**Warning**: This replaces **all** existing tools. Use `addTool()` to add individual tools.

---

### `addFlow()`

Adds a flow to the agent for structured workflow execution.

**Signature**:
```typescript
addFlow(flow: AgentFlow): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `flow` | `AgentFlow` | Yes | Flow configuration object |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.addFlow({
  id: 'order-processing',
  name: 'Order Processing Flow',
  nodes: [...],
  edges: [...]
});
```

**See also**: Flows

---

### `setFlows()`

Replaces all flows with a new set.

**Signature**:
```typescript
setFlows(flows: AgentFlow[]): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `flows` | `AgentFlow[]` | Yes | Array of flow configurations |

**Returns**: `this` (for method chaining)

---

### `setExpectedResult()`

Sets the expected result schema for agent responses (used for structured output).

**Signature**:
```typescript
setExpectedResult(schema: any): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `schema` | `any` | Yes | Zod schema or JSON schema |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
import { z } from 'zod';

builder.setExpectedResult(z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string()
}));
```

---

### `setLocale()`

Sets the locale for agent responses.

**Signature**:
```typescript
setLocale(locale: string): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `locale` | `string` | Yes | BCP 47 language tag (e.g., 'en', 'es', 'fr-CA') |

**Returns**: `this` (for method chaining)

**Default**: `'en'`

**Example**:
```typescript
builder.setLocale('es'); // Spanish
```

---

### `setSettings()`

Sets custom settings for the agent.

**Signature**:
```typescript
setSettings(settings: Record<string, any>): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `settings` | `Record<string, any>` | Yes | Arbitrary settings object |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.setSettings({
  temperature: 0.7,
  maxTokens: 2000,
  useCache: true
});
```

---

### `setMetadata()`

Sets metadata for the agent (for categorization, versioning, etc.).

**Signature**:
```typescript
setMetadata(metadata: Record<string, any>): this
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `metadata` | `Record<string, any>` | Yes | Metadata object |

**Returns**: `this` (for method chaining)

**Example**:
```typescript
builder.setMetadata({
  version: '2.0.0',
  category: 'support',
  department: 'customer-service',
  createdBy: 'admin@example.com'
});
```

---

### `build()`

Validates the configuration and creates the final `AgentConfig` object.

**Signature**:
```typescript
build(): AgentConfig
```

**Returns**: `AgentConfig` - Complete, validated agent configuration

**Throws**:
- `Error` - If required fields are missing
- `Error` - If configuration fails validation
- `Error` - If tool configurations are invalid

**Example**:
```typescript
const agent = builder.build();
```

**Validation Performed**:
1. Checks that `agentType` is set
2. Checks that `name` is set and non-empty
3. Validates tool configurations
4. Ensures all required fields have valid values

**Auto-Generated Fields**:
- `id` - Generated using nanoid if not provided
- `locale` - Defaults to `'en'` if not set
- `tools` - Defaults to `{}` if not set
- `flows` - Defaults to `[]` if not set
- `events` - Defaults to `[]` if not set
- `settings` - Defaults to `{}` if not set
- `metadata` - Defaults to `{}` if not set

## Static Methods

### `AgentBuilder.from()`

Creates a builder pre-populated with an existing configuration.

**Signature**:
```typescript
static from(config: AgentConfig): AgentBuilder
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `AgentConfig` | Yes | Existing agent configuration |

**Returns**: `AgentBuilder` instance with loaded configuration

**Example**:
```typescript
const existingAgent = { /* ... */ };
const builder = AgentBuilder.from(existingAgent);

// Modify and rebuild
const updatedAgent = builder
  .setPrompt('Updated prompt')
  .build();
```

**Use Cases**:
- Updating existing agents
- Creating variants of agents
- Agent versioning

---

### `AgentBuilder.create()`

Factory method to create a new builder instance.

**Signature**:
```typescript
static create(): AgentBuilder
```

**Returns**: New `AgentBuilder` instance

**Example**:
```typescript
const builder = AgentBuilder.create();
```

**Note**: Equivalent to `new AgentBuilder()`. Provided for consistency with other SDKs.

## Complete Example

```typescript
import { AgentBuilder, AgentType } from '@tajwal/build-ai-agent';
import { z } from 'zod';

// Create a comprehensive agent
const agent = new AgentBuilder()
  // Required fields
  .setType(AgentType.SmartAssistant)
  .setName('Product Recommendation Agent')
  
  // System prompt
  .setPrompt(`You are a product recommendation specialist.

Your capabilities:
- Search product catalog
- Compare product features
- Provide personalized recommendations
- Answer product questions

Guidelines:
- Ask about user preferences and budget
- Suggest 2-3 options with pros/cons
- Use the search tool to find products
- Be honest about limitations`)
  
  // Tools
  .addTool('search', {
    tool: 'productSearch',
    options: { maxResults: 10 }
  })
  .addTool('compare', {
    tool: 'productCompare'
  })
  
  // Structured output
  .setExpectedResult(z.object({
    recommendations: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      reason: z.string(),
      confidence: z.number()
    })),
    reasoning: z.string()
  }))
  
  // Configuration
  .setLocale('en')
  .setSettings({
    temperature: 0.7,
    maxTokens: 1500
  })
  .setMetadata({
    version: '1.0.0',
    department: 'sales',
    lastUpdated: new Date().toISOString()
  })
  
  // Build
  .build();

console.log('Agent ID:', agent.id);
console.log('Agent Name:', agent.name);
```

## Common Patterns

### Conditional Configuration

```typescript
const builder = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('Agent');

// Add tools based on environment
if (process.env.ENABLE_WEB_SEARCH === 'true') {
  builder.addTool('search', { tool: 'webSearch' });
}

if (process.env.ENABLE_DATABASE === 'true') {
  builder.addTool('db', { tool: 'databaseQuery' });
}

const agent = builder.build();
```

### Configuration Templates

```typescript
// Base configuration
const baseConfig = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setLocale('en')
  .setSettings({ temperature: 0.7 });

// Specialized agents
const supportAgent = AgentBuilder.from(baseConfig.build())
  .setName('Support Agent')
  .setPrompt('You are a support specialist')
  .addTool('tickets', { tool: 'ticketSystem' })
  .build();

const salesAgent = AgentBuilder.from(baseConfig.build())
  .setName('Sales Agent')
  .setPrompt('You are a sales representative')
  .addTool('crm', { tool: 'crmSystem' })
  .build();
```

### Dynamic Tool Addition

```typescript
const tools = [
  { key: 'search', config: { tool: 'webSearch' } },
  { key: 'calculator', config: { tool: 'calculator' } },
  { key: 'weather', config: { tool: 'weatherAPI' } }
];

const builder = new AgentBuilder()
  .setType(AgentType.SmartAssistant)
  .setName('Multi-Tool Agent');

tools.forEach(({ key, config }) => {
  builder.addTool(key, config);
});

const agent = builder.build();
```

## Error Handling

### Validation Errors

```typescript
try {
  const agent = new AgentBuilder()
    // Missing required fields
    .build();
} catch (error) {
  console.error('Validation failed:', error.message);
  // "Agent configuration validation failed: name is required"
}
```

### Tool Validation Errors

```typescript
try {
  const agent = new AgentBuilder()
    .setType(AgentType.SmartAssistant)
    .setName('Agent')
    .addTool('invalid', { tool: '' }) // Empty tool name
    .build();
} catch (error) {
  console.error('Tool validation failed:', error.message);
}
```

## Performance Considerations

- **Builder Reuse**: Don't reuse builder instances across multiple agent creations. Create a new builder for each agent.
- **Large Configurations**: For agents with many tools, consider using `setTools()` instead of multiple `addTool()` calls.
- **Validation Cost**: Validation is performed once during `build()`. Configuration changes after building require a new builder instance.

## Type Definitions

```typescript
interface AgentConfig {
  id?: string;
  name: string;
  agentType: AgentType;
  locale?: string;
  prompt?: string;
  expectedResult?: any;
  tools?: Record<string, ToolConfiguration>;
  flows?: AgentFlow[];
  events?: any[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface ToolConfiguration {
  tool: string;
  description?: string;
  options?: Record<string, any>;
}

enum AgentType {
  SmartAssistant = 'smart-assistant',
  SurveyAgent = 'survey-agent',
  CommerceAgent = 'commerce-agent',
  Flow = 'flow'
}
```

## Common Errors & Troubleshooting

### Error: "name is required"

**Cause**: `build()` called without setting a name.

**Solution**:
```typescript
builder.setName('My Agent').build();
```

### Error: "agentType is required"

**Cause**: `build()` called without setting an agent type.

**Solution**:
```typescript
builder.setType(AgentType.SmartAssistant).build();
```

### Error: "Tool configuration validation failed"

**Cause**: Invalid tool configuration (empty tool name, missing required options).

**Solution**: Ensure tool name is non-empty and matches registered tools:
```typescript
builder.addTool('search', { tool: 'webSearch' }); // ✓ Valid
builder.addTool('search', { tool: '' });           // ✗ Invalid
```

## See Also

- [AgentExecutor](./agent-executor) - Execute configured agents
- Agent Types - Understanding agent types
- [Tool Configuration](../concepts/tools) - Working with tools

---

**Last Updated**: January 2025 | **SDK Version**: 1.0.0-alpha.8

*Found an issue? [Report it](https://github.com/LinuxDevil/agent-sdk/issues/new)*
