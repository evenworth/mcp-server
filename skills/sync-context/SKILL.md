---
name: sync_context
description: Sync context from transactions to notes
---

# Sync Context

## Connection Check

First, check if Evenworth MCP tools are available. If no Evenworth tools are available (e.g., `list_transactions`, `set_note`, `get_notes`), tell the user:

> You need to connect the Evenworth MCP server first. See the [installation instructions](https://github.com/evenworth/mcp-server#install) for setup steps.

Then stop execution of this skill.

## Instructions

Using what you already know about the user — recurring people, their rent, their habits, places they've traveled — review their Evenworth data: list their notes (get_notes), then their transactions needing review. 

1) Set categories you're confident about with set_transaction_category. 
2) Save durable context as rule notes and dated periods as event notes. 
3) List anything you can't explain and ask them. 

Before saving anything personal (people's names, health-related context), show them the list and let them confirm.
