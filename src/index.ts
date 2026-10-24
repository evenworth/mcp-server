#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { promptsContent } from "../prompts/content.js";

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

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: promptsContent.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptDef = promptsContent.find((p) => p.name === request.params.name);

  if (!promptDef) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }

  const args = request.params.arguments || {};

  const requiredArgs = promptDef.arguments.filter((a) => a.required);
  for (const arg of requiredArgs) {
    if (!args[arg.name]) {
      throw new Error(`Missing required argument: ${arg.name}`);
    }
  }

  const message = promptDef.mcpMessage(args);

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
