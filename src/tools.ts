import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import { SophtronClient } from './apiClient.js';
import { saveConnection } from './storage.js';
import { CONNECT_BANK_HTML } from './ui/connect-bank.js';

const CONNECT_BANK_URI = 'ui://sophtron/connect-bank.html';

const client = new SophtronClient();

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function textResult(data: any) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: 'text' as const, text }] };
}

export function registerTools(server: McpServer) {

  // --- MCP App: Bank connection wizard resource ---
  registerAppResource(
    server,
    CONNECT_BANK_URI,
    CONNECT_BANK_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [{ uri: CONNECT_BANK_URI, mimeType: RESOURCE_MIME_TYPE, text: CONNECT_BANK_HTML }],
    }),
  );

  // --- MCP App: Connect bank (entry point, triggers UI) ---
  registerAppTool(
    server,
    'connect_bank',
    {
      title: 'Connect Bank Account',
      description: 'Launch an interactive wizard to connect a new bank or credit card account. Renders a guided UI for searching institutions, entering credentials, and handling MFA verification.',
      inputSchema: {},
      _meta: { ui: { resourceUri: CONNECT_BANK_URI } },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async () => textResult({ status: 'ready', message: 'Bank connection wizard launched.' }),
  );

  // --- Tools called by the wizard UI ---

  server.registerTool(
    'search_institutions',
    {
      title: 'Search Institutions',
      description: 'Search for banks and financial institutions by name',
      inputSchema: { query: z.string().describe('Bank or institution name') },
    },
    async ({ query }) => {
      try {
        const results = await client.searchInstitutions(query);
        return textResult(results || []);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  server.registerTool(
    'create_connection',
    {
      title: 'Create Bank Connection',
      description: 'Create a new bank connection with login credentials. Returns a job ID for polling.',
      inputSchema: {
        institutionId: z.string().describe('Institution ID from search results'),
        username: z.string().describe('Bank login username'),
        password: z.string().describe('Bank login password'),
        pin: z.string().optional().describe('PIN if required'),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async ({ institutionId, username, password, pin }) => {
      try {
        const result = await client.createUserInstitution(institutionId, username, password, pin);
        return textResult(result);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  server.registerTool(
    'poll_job',
    {
      title: 'Poll Job Status',
      description: 'Check the status of a bank connection job. Used during the connection flow.',
      inputSchema: { jobId: z.string().describe('Job ID from create_connection') },
    },
    async ({ jobId }) => {
      try {
        const job = await client.getJobInfo(jobId);
        return textResult(job);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  server.registerTool(
    'answer_mfa',
    {
      title: 'Answer MFA Challenge',
      description: 'Submit an MFA response (security question answer, verification code, captcha, etc.)',
      inputSchema: {
        jobId: z.string().describe('Job ID'),
        type: z.enum(['security_answer', 'token_choice', 'token_input', 'token_phone', 'captcha']).describe('Type of MFA challenge'),
        value: z.string().describe('The answer/code/choice'),
      },
      annotations: { readOnlyHint: false },
    },
    async ({ jobId, type, value }) => {
      try {
        let result;
        switch (type) {
          case 'security_answer':
            result = await client.updateJobSecurityAnswer(jobId, value);
            break;
          case 'token_choice':
            result = await client.updateJobTokenChoice(jobId, value);
            break;
          case 'token_input':
            result = await client.updateJobTokenInput(jobId, value);
            break;
          case 'token_phone':
            result = await client.updateJobTokenPhoneVerify(jobId, value === 'true');
            break;
          case 'captcha':
            result = await client.updateJobCaptchaInput(jobId, value);
            break;
        }
        return textResult(result || { ok: true });
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  server.registerTool(
    'get_connection_accounts',
    {
      title: 'Get Connection Accounts',
      description: 'List accounts for a specific bank connection',
      inputSchema: { userInstitutionId: z.string().describe('UserInstitution ID from the connection') },
    },
    async ({ userInstitutionId }) => {
      try {
        const accounts = await client.getUserInstitutionAccounts(userInstitutionId);
        return textResult(accounts || []);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  // --- Data query tools (used directly by Claude) ---

  server.registerTool(
    'list_connections',
    {
      title: 'List Bank Connections',
      description: 'List all linked bank connections (UserInstitutions) for this account.',
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const connections = await client.getUserInstitutionsByUser();
        if (!connections || (Array.isArray(connections) && connections.length === 0)) {
          return textResult('No bank connections found. Use connect_bank to link an account.');
        }
        return textResult(connections);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  server.registerTool(
    'list_accounts',
    {
      title: 'List Accounts',
      description: 'List all accounts for a bank connection. Provide the UserInstitution ID.',
      inputSchema: {
        userInstitutionId: z.string().describe('UserInstitution ID'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ userInstitutionId }) => {
      try {
        const accounts = await client.getUserInstitutionAccounts(userInstitutionId);
        return textResult(accounts || []);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  server.registerTool(
    'get_transactions',
    {
      title: 'Get Transactions',
      description: 'Get transactions for a bank account. Defaults to last 90 days.',
      inputSchema: {
        accountId: z.string().describe('Account ID'),
        startDate: z.string().optional().describe('Start date (YYYY-MM-DD). Defaults to 90 days ago.'),
        endDate: z.string().optional().describe('End date (YYYY-MM-DD). Defaults to today.'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ accountId, startDate, endDate }) => {
      try {
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        const transactions = await client.getTransactions(accountId, start, end);
        if (!transactions || (Array.isArray(transactions) && transactions.length === 0)) {
          return textResult('No transactions found for this period.');
        }
        return textResult(transactions);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );

  server.registerTool(
    'refresh_account',
    {
      title: 'Refresh Account',
      description: 'Trigger a fresh data pull from the bank for a specific account. Returns a job ID to poll.',
      inputSchema: {
        accountId: z.string().describe('Account ID to refresh'),
      },
      annotations: { readOnlyHint: false },
    },
    async ({ accountId }) => {
      try {
        const result = await client.refreshAccount(accountId);
        return textResult(result);
      } catch (e) {
        return textResult({ error: formatError(e) });
      }
    },
  );
}
