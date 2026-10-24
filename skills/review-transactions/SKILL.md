---
name: review_transactions
description: Review transactions that need categorization
---

# Review Transactions

## Connection Check

First, check if Evenworth MCP tools are available. If no Evenworth tools are available (e.g., `list_transactions`, `set_note`, `get_notes`), tell the user:

> You need to connect the Evenworth MCP server first. See the [installation instructions](https://github.com/evenworth/mcp-server#install) for setup steps.

Then stop execution of this skill.

## Instructions

Fetch the user's transactions that need review (list_transactions with needsReview, largest amounts first). For each one, tell them what it is if you can, propose a category, and ask about the ones you can't explain. Apply their answers with set_transaction_category and save context they give you with set_transaction_note. If they explain a recurring counterparty, also save it as a rule note.
