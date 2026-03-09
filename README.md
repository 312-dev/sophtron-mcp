# sophtron-mcp

A Claude Desktop MCP server for querying bank accounts, credit cards, and transactions via [Sophtron](https://sophtron.com)'s financial data API.

**Patched for Claude** — forked from [sophtron/chagpt-mcp](https://github.com/sophtron/chagpt-mcp) which was built exclusively for ChatGPT. This version replaces the OpenAI-specific transport, auth, and widget code with a standard stdio MCP server that works with Claude Desktop, Claude Code, and any MCP-compatible client.

**Free alternative** to requiring a paid budgeting app (Monarch Money, YNAB, etc.) as middleware. Sophtron provides free API access for individual use, connecting directly to 12,000+ financial institutions via their data aggregation layer.

## Setup

### 1. Get Sophtron credentials

Sign up at [sophtron.com](https://sophtron.com) and get your **User ID** and **Access Key**.

### 2. Install

```bash
git clone https://github.com/312-dev/sophtron-mcp.git
cd sophtron-mcp
npm install
npm run build
```

### 3. Configure credentials

```bash
cp .env.example .env
# Edit .env with your Sophtron User ID and Access Key
```

### 4. Add to Claude Desktop

Add this to your `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sophtron": {
      "command": "node",
      "args": ["/path/to/sophtron-mcp/dist/index.js"],
      "env": {
        "SOPHTRON_USER_ID": "your-user-id",
        "SOPHTRON_ACCESS_KEY": "your-access-key"
      }
    }
  }
}
```

Or for Claude Code, add to `~/.claude.json` under `mcpServers`:

```json
{
  "sophtron": {
    "type": "stdio",
    "command": "node",
    "args": ["/path/to/sophtron-mcp/dist/index.js"],
    "env": {
      "SOPHTRON_USER_ID": "your-user-id",
      "SOPHTRON_ACCESS_KEY": "your-access-key"
    }
  }
}
```

### 5. Connect your bank

Bank connections are managed through Sophtron's infrastructure. To link your accounts:

1. Use the Sophtron widget through their [ChatGPT integration](https://mcp.sophtron.com/mcp) or web portal to connect your bank
2. Once connected, this MCP server can query all your account data from Claude

## Available tools

| Tool | Description |
|------|-------------|
| `setup_customer` | Create or find a Sophtron customer profile (run first) |
| `get_customer` | Look up a customer by name |
| `list_connections` | List all linked bank connections |
| `save_connection` | Manually save a connection reference |
| `list_accounts` | List all accounts across all connections |
| `get_account` | Get details for a specific account |
| `get_member_accounts` | List accounts for a specific bank connection |
| `get_transactions` | Get transactions for an account (defaults to last 90 days) |
| `get_identity` | Get profile/identity info for a connection |
| `search_institutions` | Search for banks by name |

## How it works

This server communicates with Sophtron's REST API using HMAC-SHA256 signed requests. Your credentials never leave your machine — they're used locally to sign API calls.

Data is cached locally in `~/.sophtron-mcp/`:
- `customer.json` — your Sophtron customer ID
- `connections.json` — saved bank connection references

## What changed from the original

The [upstream repo](https://github.com/sophtron/chagpt-mcp) is built for ChatGPT with:
- OpenAI-specific widget rendering (`window.openai.setWidgetState`)
- OAuth2 JWT authentication flow
- Express HTTP transport only
- In-memory connection storage
- `structuredContent` and `openai/*` metadata

This fork replaces all of that with:
- Standard MCP stdio transport (works with any MCP client)
- Direct HMAC API authentication (no OAuth needed)
- Disk-based persistence
- Clean tool definitions without vendor lock-in

## License

MIT
