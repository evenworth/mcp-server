#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "evenworth",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {},
    },
  }
);

interface PromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  messageTemplate: (args: Record<string, string>) => string;
}

const prompts: PromptDefinition[] = [
  {
    name: "add_preference",
    description: "Save a standing preference rule in Evenworth",
    arguments: [
      {
        name: "preference",
        description: "The preference to save",
        required: true,
      },
    ],
    messageTemplate: (args) =>
      `Save this as a standing preference in Evenworth: '${args.preference}'. Use set_note with category 'rule' and a short kebab-case key starting with 'rule:'. Confirm what was saved in one line.`,
  },
  {
    name: "add_event",
    description: "Save a dated event in Evenworth",
    arguments: [
      {
        name: "name",
        description: "Event name",
        required: true,
      },
      {
        name: "starts_on",
        description: "Start date (YYYY-MM-DD)",
        required: true,
      },
      {
        name: "ends_on",
        description: "End date (YYYY-MM-DD)",
        required: true,
      },
      {
        name: "details",
        description: "Additional event details",
        required: false,
      },
    ],
    messageTemplate: (args) => {
      const detailsPart = args.details ? ` ${args.details}.` : "";
      return `Save a dated event in Evenworth: '${args.name}', ${args.starts_on} to ${args.ends_on}.${detailsPart} Use set_note with category 'event', key 'event:<kebab-name>-<year>', and both dates. Events let searches and summaries scope to the period.`;
    },
  },
  {
    name: "review_transactions",
    description: "Review transactions that need categorization",
    arguments: [],
    messageTemplate: () =>
      "Fetch my transactions that need review (list_transactions with needsReview, largest amounts first). For each one, tell me what it is if you can, propose a category, and ask me about the ones you can't explain. Apply my answers with set_transaction_category and save context I give you with set_transaction_note. If I explain a recurring counterparty, also save it as a rule note.",
  },
  {
    name: "sync_context",
    description: "Sync context from transactions to notes",
    arguments: [],
    messageTemplate: () =>
      "Using what you already know about me — recurring people, my rent, my habits, places I've traveled — review my Evenworth data: list my notes (get_notes), then my transactions needing review. 1) Set categories you're confident about with set_transaction_category. 2) Save durable context as rule notes and dated periods as event notes. 3) List anything you can't explain and ask me. Before saving anything personal (people's names, health-related context), show me the list and let me confirm.",
  },
];

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: prompts.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments || [],
    })),
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptDef = prompts.find((p) => p.name === request.params.name);
  
  if (!promptDef) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }

  const args = request.params.arguments || {};
  
  // Check required arguments
  const requiredArgs = promptDef.arguments?.filter((a) => a.required) || [];
  for (const arg of requiredArgs) {
    if (!args[arg.name]) {
      throw new Error(`Missing required argument: ${arg.name}`);
    }
  }

  const message = promptDef.messageTemplate(args);

  return {
    description: promptDef.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: message,
        },
      } as PromptMessage,
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Evenworth MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
