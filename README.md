# Evenworth MCP server

Ask an AI questions about your whole financial picture — in the client you already use.

[Evenworth](https://evenworth.io) is a read-only net-worth tool. This repository documents its **MCP server**: a remote [Model Context Protocol](https://modelcontextprotocol.io) endpoint that lets an AI assistant read the same balances, transactions, cash flow, positions and targets the Evenworth app shows you.

It is **open MCP, not a built-in assistant**. Connect whatever client you use — Claude, Cursor, ChatGPT, Grok, Gemini, VS Code, Claude Code, Gemini CLI — and ask questions over sources Plaid-only tools can't reach: Interactive Brokers (including options P&L), crypto wallets, manual accounts, multi-currency.

**The MCP server is free.** It is part of the free plan, and there is nothing to buy to use it.

## 60-second setup

1. **Create a free Evenworth account** at [app.evenworth.io](https://app.evenworth.io) — an email address, no card.
2. **Add the server to your client** with the URL `https://app.evenworth.io/mcp`.
3. **Sign in** when your client opens the Evenworth consent page, and choose which workspaces it may read.
4. **Ask a question** — for example, "How many months of runway do I have?"

You can also paste the URL into a client config:

```json
{
  "mcpServers": {
    "evenworth": {
      "type": "http",
      "url": "https://app.evenworth.io/mcp"
    }
  }
}
```

## Clients

| Client | How to add it |
| --- | --- |
| Claude | Customize → Connectors → Add custom connector, paste the URL, then Connect. |
| Cursor | [One-click install](cursor://anysphere.cursor-deeplink/mcp/install?name=evenworth&config=eyJ1cmwiOiJodHRwczovL2FwcC5ldmVud29ydGguaW8vbWNwIn0=), then sign in. |
| VS Code | [One-click install](vscode:mcp/install?%7B%22name%22%3A%22evenworth%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapp.evenworth.io%2Fmcp%22%7D), then sign in. |
| ChatGPT | Plugins → + → Add custom MCP server, paste the URL, choose OAuth. Web only, paid plans. |
| Grok | New Connector → Custom, paste the URL, then sign in. |
| Gemini | Settings → Connected Apps → Add a custom app, paste the URL. US personal accounts only. |
| Claude Code | `claude mcp add --transport http evenworth https://app.evenworth.io/mcp`, then `/mcp` to sign in. |
| Gemini CLI | `gemini mcp add --transport http evenworth https://app.evenworth.io/mcp`, then `/mcp auth` to sign in. |

The client opens the consent page itself; you never paste credentials into a config file.

## What the AI can read

Balances, daily history, transactions and their summary, monthly cash flow and where money moved, monthly snapshots, IBKR positions, trades, dividends and P&L, settings and targets, notes, plans, and alert rules — scoped to the workspaces you grant.

## What it cannot do

Evenworth is **read-only by design**. No tool moves money — not between your accounts, not out of them. Tools that change Evenworth's own records (tags, notes, targets, settings) are marked as writes, so your client asks before running them.

- **Your bank login never reaches Evenworth.** Bank connections go through Plaid; you enter those credentials with Plaid, not with Evenworth.
- **Your broker connection is read-only.** Interactive Brokers connects directly; API keys are held encrypted and never shown again.
- **Crypto is watch-only.** You give a public wallet address — the same string you'd paste into a block explorer — never a private key or seed phrase.
- **Tokens are hashed and revocable.** Each assistant connection is a token you can revoke any time under Workspace → AI assistants.

## Sources

Plaid (banks), Interactive Brokers, crypto wallets, CSV import, and manual accounts in any currency.

## Reporting issues and questions

This repository is the support surface for the MCP server. [Open an issue](../../issues) for bugs, feature requests, or questions.

## Links

- [evenworth.io](https://evenworth.io)
- [Sign up](https://app.evenworth.io)