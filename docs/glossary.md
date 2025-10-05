---
sidebar_position: 100
title: Glossary
description: Definitions of key terms and concepts in Build AI Agent SDK
---

# Glossary

This page defines key terms used throughout the Build AI Agent SDK documentation.

## A

### Agent
A configured AI entity with a specific purpose, behavior, and capabilities. An agent combines an LLM with tools, prompts, and execution logic to accomplish tasks.

**Example**: A customer support agent configured with FAQs and ticket creation tools.

### Agent Config
The complete configuration object (`AgentConfig`) defining an agent's type, prompt, tools, flows, and metadata. Created using `AgentBuilder`.

### Agent Executor
The `AgentExecutor` class that orchestrates agent execution, managing message flow, tool calls, streaming, and state.

### Agent Type
A predefined category of agent behavior (`AgentType` enum):
- `SmartAssistant`: General-purpose conversational agent with tool calling
- `SurveyAgent`: Specialized for conducting surveys
- `CommerceAgent`: Optimized for e-commerce interactions
- `Flow`: Workflow-based agent following structured flows

## B

### Builder Pattern
A creational design pattern used by `AgentBuilder` to construct complex agent configurations through method chaining.

**Example**: `.setName().setType().addTool().build()`

## C

### Core Message
The `CoreMessage` type from Vercel AI SDK representing a single message in a conversation with role and content.

### Conversation Context
The history of messages and state maintained across agent executions, enabling continuity in multi-turn conversations.

## E

### Execution Event
An event (`ExecutionEvent`) emitted during agent execution, such as text generation, tool calls, or errors. Used for monitoring and debugging.

### Execution Options
The `ExecuteOptions` configuration object passed to `AgentExecutor.execute()` specifying input, provider, tools, and behavior.

### Execution Result
The `ExecutionResult` object returned after agent execution, containing generated text, tool calls, usage statistics, and metadata.

## F

### Flow
A structured multi-step workflow (`AgentFlow`) that orchestrates complex operations through sequences of agent interactions and tool executions.

### Flow Node
An individual step in a flow, which can be an LLM call, tool execution, conditional branch, or sub-flow.

### Framework Agnostic
Architecture principle ensuring the SDK works with any JavaScript framework (React, Vue, Express, etc.) without dependencies on specific frameworks.

## L

### LLM Provider
An implementation of the `LLMProvider` interface that adapts a specific LLM service (OpenAI, Anthropic, Ollama) to the SDK's standard interface.

### Locale
The language and regional settings (e.g., 'en', 'es', 'fr') used for agent responses and tool interactions.

## M

### Memory Manager
Component managing conversation context, message history, and state persistence across executions.

### Message
A single communication unit in a conversation with a role (`system`, `user`, `assistant`, `tool`) and content.

### Model
The specific LLM variant used for generation (e.g., 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus').

## P

### Prompt
The system message or instructions that define an agent's behavior, personality, and capabilities.

**Example**: "You are a helpful customer support agent. Be professional and concise."

### Provider
See **LLM Provider**.

## R

### Repository
An interface for data persistence operations (saving agents, messages, tool results). Implementations include mock repositories and database adapters (Drizzle).

## S

### Session
A unique identifier grouping related agent executions, enabling conversation continuity and state management.

### Streaming
Real-time text generation where response chunks are delivered incrementally as they're generated, rather than waiting for complete responses.

### Stream Chunk
A single piece of streaming data (`StreamChunk`) containing text deltas, tool calls, or metadata.

## T

### Tool
A function that agents can invoke to interact with external systems, perform calculations, or fetch data. Defined by `ToolDescriptor` and registered in `ToolRegistry`.

**Example**: Weather API tool, database query tool, calculator.

### Tool Call
An invocation of a tool by an LLM during execution. Contains the tool name, arguments, and a unique identifier.

### Tool Configuration
The `ToolConfiguration` object specifying which tool to use and its options when adding tools to an agent.

### Tool Descriptor
The `ToolDescriptor` object containing a tool's display name, implementation, and optional streaming controller.

### Tool Registry
The `ToolRegistry` class managing tool registration, retrieval, and lifecycle.

### Type Safety
Compile-time verification using TypeScript types to prevent runtime errors from invalid configurations or API usage.

## U

### Usage
Token consumption statistics including prompt tokens, completion tokens, and total tokens used in an LLM request.

## W

### Workflow
See **Flow**.

## Common Acronyms

- **SDK**: Software Development Kit
- **LLM**: Large Language Model
- **API**: Application Programming Interface
- **AI**: Artificial Intelligence
- **JSON**: JavaScript Object Notation
- **HTTP**: Hypertext Transfer Protocol
- **UUID**: Universally Unique Identifier
- **DTO**: Data Transfer Object

## Related Topics

- [Core Concepts: Agents](./concepts/agents)
- [Core Concepts: Tools](./concepts/tools)
- Core Concepts: Flows
- API Reference: Types

---

**Last Updated**: January 2025 | **SDK Version**: 1.0.0-alpha.8

*Missing a term? [Request an addition](https://github.com/LinuxDevil/agent-sdk/issues/new)*
