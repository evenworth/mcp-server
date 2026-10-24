---
name: add_event
description: Save a dated event in Evenworth
---

# Add Event

## Connection Check

First, check if Evenworth MCP tools are available. If no Evenworth tools are available (e.g., `list_transactions`, `set_note`, `get_notes`), tell the user:

> You need to connect the Evenworth MCP server first. See the [installation instructions](https://github.com/evenworth/mcp-server#install) for setup steps.

Then stop execution of this skill.

## Instructions

If the user did not provide the event name, start date, or end date, ask them for those required details. The details field is optional.

Save the dated event in Evenworth: use set_note with category 'event', key 'event:<kebab-name>-<year>', and both dates. Events let searches and summaries scope to the period.
