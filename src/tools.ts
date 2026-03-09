import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SophtronClient } from './apiClient.js';
import { loadConnections, saveConnections, loadCustomer, saveCustomer } from './storage.js';
import config from './config.js';

const client = new SophtronClient();

async function resolveCustomerId(): Promise<string | null> {
  // Check disk cache first
  const cached = loadCustomer();
  if (cached?.customerId) return cached.customerId;

  // Try env var customer name
  if (config.CustomerName) {
    const customer = await client.getCustomer(config.CustomerName);
    if (customer?.CustomerID) {
      saveCustomer(customer.CustomerID, config.CustomerName);
      return customer.CustomerID;
    }
  }

  return null;
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function registerTools(server: McpServer) {

  // --- Customer discovery ---

  server.registerTool('setup_customer', {
    title: 'Setup Customer',
    description: 'Create or find a Sophtron customer. Run this first if you have not connected before. Uses your configured SOPHTRON_CUSTOMER_NAME or creates a new one with the given name.',
    inputSchema: {
      name: z.string().describe('Unique name for the customer (e.g. your email or username)'),
    },
  }, async ({ name }) => {
    try {
      let customer = await client.getCustomer(name);
      if (!customer) {
        customer = await client.createCustomer(name);
      }
      if (customer?.CustomerID) {
        saveCustomer(customer.CustomerID, name);
        return {
          content: [{ type: 'text' as const, text: `Customer ready.\nID: ${customer.CustomerID}\nName: ${name}\n\nSaved to ~/.sophtron-mcp/customer.json` }],
        };
      }
      return {
        content: [{ type: 'text' as const, text: 'Could not create or find customer. Check your Sophtron credentials.' }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  server.registerTool('get_customer', {
    title: 'Get Customer',
    description: 'Look up a Sophtron customer by unique ID/name',
    inputSchema: {
      name: z.string().describe('Customer unique ID or name'),
    },
  }, async ({ name }) => {
    try {
      const customer = await client.getCustomer(name);
      return {
        content: [{ type: 'text' as const, text: customer ? JSON.stringify(customer, null, 2) : 'No customer found with that name.' }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  // --- Bank connections (members) ---

  server.registerTool('list_connections', {
    title: 'List Connections',
    description: 'List all bank connections (members) for the current customer. Shows which banks/institutions are linked.',
    inputSchema: {},
  }, async () => {
    try {
      const customerId = await resolveCustomerId();
      if (!customerId) {
        return { content: [{ type: 'text' as const, text: 'No customer configured. Run setup_customer first.' }] };
      }
      const members = await client.getMembers(customerId);
      if (!members || (Array.isArray(members) && members.length === 0)) {
        return { content: [{ type: 'text' as const, text: 'No bank connections found. You need to connect a bank account through Sophtron first.' }] };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(members, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  server.registerTool('save_connection', {
    title: 'Save Connection',
    description: 'Manually save a bank connection reference (e.g. from a widget session). Persists to disk.',
    inputSchema: {
      institutionName: z.string().describe('Name of the bank/institution'),
      memberId: z.string().describe('Member/connection ID'),
      accountId: z.string().optional().describe('Account ID if known'),
    },
  }, async ({ institutionName, memberId, accountId }) => {
    const connections = loadConnections();
    connections[institutionName] = {
      memberId,
      accountId: accountId || null,
      institutionName,
      savedAt: new Date().toISOString(),
    };
    saveConnections(connections);
    return {
      content: [{ type: 'text' as const, text: `Connection saved for ${institutionName}.\nMember ID: ${memberId}` }],
    };
  });

  // --- Accounts ---

  server.registerTool('list_accounts', {
    title: 'List Accounts',
    description: 'List all accounts across all bank connections for the current customer. Shows account names, types, and balances.',
    inputSchema: {},
  }, async () => {
    try {
      const customerId = await resolveCustomerId();
      if (!customerId) {
        return { content: [{ type: 'text' as const, text: 'No customer configured. Run setup_customer first.' }] };
      }
      const accounts = await client.getAccountsV3(customerId);
      if (!accounts || (Array.isArray(accounts) && accounts.length === 0)) {
        return { content: [{ type: 'text' as const, text: 'No accounts found.' }] };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(accounts, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  server.registerTool('get_account', {
    title: 'Get Account Details',
    description: 'Get detailed information about a specific account',
    inputSchema: {
      memberId: z.string().describe('Member/connection ID'),
      accountId: z.string().describe('Account ID'),
    },
  }, async ({ memberId, accountId }) => {
    try {
      const customerId = await resolveCustomerId();
      if (!customerId) {
        return { content: [{ type: 'text' as const, text: 'No customer configured. Run setup_customer first.' }] };
      }
      const account = await client.getAccountV3(customerId, memberId, accountId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(account, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  server.registerTool('get_member_accounts', {
    title: 'Get Member Accounts',
    description: 'List all accounts for a specific bank connection (member)',
    inputSchema: {
      memberId: z.string().describe('Member/connection ID'),
    },
  }, async ({ memberId }) => {
    try {
      const customerId = await resolveCustomerId();
      if (!customerId) {
        return { content: [{ type: 'text' as const, text: 'No customer configured. Run setup_customer first.' }] };
      }
      const accounts = await client.getMemberAccountsV3(customerId, memberId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(accounts, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  // --- Transactions ---

  server.registerTool('get_transactions', {
    title: 'Get Transactions',
    description: 'Get transactions for an account within a date range. Defaults to the last 90 days if no dates are specified.',
    inputSchema: {
      accountId: z.string().describe('Account ID'),
      startDate: z.string().optional().describe('Start date (YYYY-MM-DD). Defaults to 90 days ago.'),
      endDate: z.string().optional().describe('End date (YYYY-MM-DD). Defaults to today.'),
    },
  }, async ({ accountId, startDate, endDate }) => {
    try {
      const customerId = await resolveCustomerId();
      if (!customerId) {
        return { content: [{ type: 'text' as const, text: 'No customer configured. Run setup_customer first.' }] };
      }
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      const transactions = await client.getTransactionsV3(customerId, accountId, start, end);
      if (!transactions || (Array.isArray(transactions) && transactions.length === 0)) {
        return { content: [{ type: 'text' as const, text: 'No transactions found for this period.' }] };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(transactions, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  // --- Identity / Profile ---

  server.registerTool('get_identity', {
    title: 'Get Identity',
    description: 'Get profile/identity information for a bank connection (name, address, etc.)',
    inputSchema: {
      memberId: z.string().describe('Member/connection ID'),
    },
  }, async ({ memberId }) => {
    try {
      const customerId = await resolveCustomerId();
      if (!customerId) {
        return { content: [{ type: 'text' as const, text: 'No customer configured. Run setup_customer first.' }] };
      }
      const identity = await client.getIdentityV3(customerId, memberId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(identity, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });

  // --- Institution search ---

  server.registerTool('search_institutions', {
    title: 'Search Institutions',
    description: 'Search for banks and financial institutions by name. Useful for finding institution IDs.',
    inputSchema: {
      query: z.string().describe('Bank or institution name to search for'),
    },
  }, async ({ query }) => {
    try {
      const results = await client.searchInstitutions(query);
      if (!results || (Array.isArray(results) && results.length === 0)) {
        return { content: [{ type: 'text' as const, text: 'No institutions found matching that query.' }] };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }],
      };
    } catch (e) {
      return { content: [{ type: 'text' as const, text: `Error: ${formatError(e)}` }] };
    }
  });
}
