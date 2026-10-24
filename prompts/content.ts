export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

export interface PromptContent {
  name: string;
  description: string;
  arguments: PromptArgument[];
  mcpMessage: (args: Record<string, string>) => string;
  skillInstructions: string;
}

export const promptsContent: PromptContent[] = [
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
    mcpMessage: (args) =>
      `Save this as a standing preference in Evenworth: '${args.preference}'. Use set_note with category 'rule' and a short kebab-case key starting with 'rule:'. Confirm what was saved in one line.`,
    skillInstructions: `If the user did not provide a preference, ask them what preference they want to save.

Save the preference as a standing rule in Evenworth: use set_note with category 'rule' and a short kebab-case key starting with 'rule:'. Confirm what was saved in one line.`,
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
    mcpMessage: (args) => {
      const detailsPart = args.details ? ` ${args.details}.` : "";
      return `Save a dated event in Evenworth: '${args.name}', ${args.starts_on} to ${args.ends_on}.${detailsPart} Use set_note with category 'event', key 'event:<kebab-name>-<year>', and both dates. Events let searches and summaries scope to the period.`;
    },
    skillInstructions: `If the user did not provide the event name, start date, or end date, ask them for those required details. The details field is optional.

Save the dated event in Evenworth: use set_note with category 'event', key 'event:<kebab-name>-<year>', and both dates. Events let searches and summaries scope to the period.`,
  },
  {
    name: "review_transactions",
    description: "Review transactions that need categorization",
    arguments: [],
    mcpMessage: () =>
      "Fetch my transactions that need review (list_transactions with needsReview, largest amounts first). For each one, tell me what it is if you can, propose a category, and ask me about the ones you can't explain. Apply my answers with set_transaction_category and save context I give you with set_transaction_note. If I explain a recurring counterparty, also save it as a rule note.",
    skillInstructions: `Fetch the user's transactions that need review (list_transactions with needsReview, largest amounts first). For each one, tell them what it is if you can, propose a category, and ask about the ones you can't explain. Apply their answers with set_transaction_category and save context they give you with set_transaction_note. If they explain a recurring counterparty, also save it as a rule note.`,
  },
  {
    name: "sync_context",
    description: "Sync context from transactions to notes",
    arguments: [],
    mcpMessage: () =>
      "Using what you already know about me — recurring people, my rent, my habits, places I've traveled — review my Evenworth data: list my notes (get_notes), then my transactions needing review. 1) Set categories you're confident about with set_transaction_category. 2) Save durable context as rule notes and dated periods as event notes. 3) List anything you can't explain and ask me. Before saving anything personal (people's names, health-related context), show me the list and let me confirm.",
    skillInstructions: `Using what you already know about the user — recurring people, their rent, their habits, places they've traveled — review their Evenworth data: list their notes (get_notes), then their transactions needing review. 

1) Set categories you're confident about with set_transaction_category. 
2) Save durable context as rule notes and dated periods as event notes. 
3) List anything you can't explain and ask them. 

Before saving anything personal (people's names, health-related context), show them the list and let them confirm.`,
  },
];
