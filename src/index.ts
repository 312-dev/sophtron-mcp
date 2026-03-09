#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools.js';
import config from './config.js';

const server = new McpServer({
  name: config.ServerName,
  version: config.ServerVersion,
}, {
  capabilities: {
    tools: {},
    resources: {},
  },
});

registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
