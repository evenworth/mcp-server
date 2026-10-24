import { describe, it, expect } from "vitest";

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

function listPrompts() {
  return {
    prompts: prompts.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments || [],
    })),
  };
}

function getPrompt(name: string, args: Record<string, string> = {}) {
  const promptDef = prompts.find((p) => p.name === name);

  if (!promptDef) {
    throw new Error(`Prompt not found: ${name}`);
  }

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
      },
    ],
  };
}

describe("MCP Prompts", () => {

  describe("prompts/list", () => {
    it("returns all four prompts with their argument schemas", () => {
      const response = listPrompts();

      expect(response.prompts).toHaveLength(4);

      const promptNames = response.prompts.map((p) => p.name);
      expect(promptNames).toContain("add_preference");
      expect(promptNames).toContain("add_event");
      expect(promptNames).toContain("review_transactions");
      expect(promptNames).toContain("sync_context");

      const addPreference = response.prompts.find(
        (p) => p.name === "add_preference"
      );
      expect(addPreference?.arguments).toHaveLength(1);
      expect(addPreference?.arguments?.[0].name).toBe("preference");
      expect(addPreference?.arguments?.[0].required).toBe(true);

      const addEvent = response.prompts.find((p) => p.name === "add_event");
      expect(addEvent?.arguments).toHaveLength(4);
      expect(addEvent?.arguments?.map((a) => a.name)).toEqual([
        "name",
        "starts_on",
        "ends_on",
        "details",
      ]);
      expect(
        addEvent?.arguments?.filter((a) => a.required).map((a) => a.name)
      ).toEqual(["name", "starts_on", "ends_on"]);

      const reviewTransactions = response.prompts.find(
        (p) => p.name === "review_transactions"
      );
      expect(reviewTransactions?.arguments).toHaveLength(0);

      const syncContext = response.prompts.find(
        (p) => p.name === "sync_context"
      );
      expect(syncContext?.arguments).toHaveLength(0);
    });
  });

  describe("prompts/get", () => {
    it("interpolates arguments for add_event with all four args", () => {
      const response = getPrompt("add_event", {
        name: "Product Launch",
        starts_on: "2024-03-15",
        ends_on: "2024-03-20",
        details: "Major product release with press coverage",
      });

      expect(response.messages).toHaveLength(1);
      expect(response.messages[0].role).toBe("user");
      expect(response.messages[0].content.type).toBe("text");

      const text = response.messages[0].content.text;
      expect(text).toContain("Product Launch");
      expect(text).toContain("2024-03-15");
      expect(text).toContain("2024-03-20");
      expect(text).toContain("Major product release with press coverage");
      expect(text).toMatch(
        /Save a dated event in Evenworth: 'Product Launch', 2024-03-15 to 2024-03-20\. Major product release with press coverage\./
      );
    });

    it("rejects a missing required argument", () => {
      expect(() => getPrompt("add_preference", {})).toThrow(
        "Missing required argument: preference"
      );
    });

    it("works without optional arguments", () => {
      const response = getPrompt("add_event", {
        name: "Conference",
        starts_on: "2024-06-01",
        ends_on: "2024-06-03",
      });

      const text = response.messages[0].content.text;
      expect(text).toContain("Conference");
      expect(text).toContain("2024-06-01");
      expect(text).toContain("2024-06-03");
      expect(text).not.toContain("undefined");
    });

    it("interpolates add_preference correctly", () => {
      const response = getPrompt("add_preference", {
        preference: "Always categorize coffee purchases as Personal",
      });

      const text = response.messages[0].content.text;
      expect(text).toBe(
        "Save this as a standing preference in Evenworth: 'Always categorize coffee purchases as Personal'. Use set_note with category 'rule' and a short kebab-case key starting with 'rule:'. Confirm what was saved in one line."
      );
    });

    it("returns correct message for review_transactions", () => {
      const response = getPrompt("review_transactions");

      const text = response.messages[0].content.text;
      expect(text).toBe(
        "Fetch my transactions that need review (list_transactions with needsReview, largest amounts first). For each one, tell me what it is if you can, propose a category, and ask me about the ones you can't explain. Apply my answers with set_transaction_category and save context I give you with set_transaction_note. If I explain a recurring counterparty, also save it as a rule note."
      );
    });

    it("returns correct message for sync_context", () => {
      const response = getPrompt("sync_context");

      const text = response.messages[0].content.text;
      expect(text).toBe(
        "Using what you already know about me — recurring people, my rent, my habits, places I've traveled — review my Evenworth data: list my notes (get_notes), then my transactions needing review. 1) Set categories you're confident about with set_transaction_category. 2) Save durable context as rule notes and dated periods as event notes. 3) List anything you can't explain and ask me. Before saving anything personal (people's names, health-related context), show me the list and let me confirm."
      );
    });
  });
});
