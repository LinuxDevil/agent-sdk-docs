import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'overview',
      label: 'What is Build AI Agent?'
    },
    'intro',
    'installation',
    'quick-start',
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'concepts/agents',
        'concepts/tools',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/building-chatbot',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/chatbot',
      ],
    },
    {
      type: 'doc',
      id: 'glossary',
      label: 'Glossary'
    },
  ],

  // API Reference sidebar
  apiSidebar: [
    'api/overview',
    {
      type: 'category',
      label: 'Core API',
      items: [
        'api/agent-builder',
        'api/agent-executor',
      ],
    },
  ],
};

export default sidebars;
