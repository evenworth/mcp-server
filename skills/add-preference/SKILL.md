---
name: add_preference
description: Save a standing preference rule in Evenworth
---

# Add Preference

## Connection Check

First, check if Evenworth MCP tools are available. If no Evenworth tools are available (e.g., `list_transactions`, `set_note`, `get_notes`), tell the user:

> You need to connect the Evenworth MCP server first. See the [installation instructions](https://github.com/evenworth/mcp-server#install) for setup steps.

Then stop execution of this skill.

## Instructions

If the user did not provide a preference, ask them what preference they want to save.

Save the preference as a standing rule in Evenworth: use set_note with category 'rule' and a short kebab-case key starting with 'rule:'. Confirm what was saved in one line.
