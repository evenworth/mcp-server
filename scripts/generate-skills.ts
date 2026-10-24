#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { promptsContent } from "../prompts/content.js";

const SKILLS_DIR = join(process.cwd(), "skills");

function generateSkillMd(
  name: string,
  description: string,
  instructions: string
): string {
  return `---
name: ${name}
description: ${description}
---

# ${name.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}

## Connection Check

First, check if Evenworth MCP tools are available. If no Evenworth tools are available (e.g., \`list_transactions\`, \`set_note\`, \`get_notes\`), tell the user:

> You need to connect the Evenworth MCP server first. See the [installation instructions](https://github.com/evenworth/mcp-server#install) for setup steps.

Then stop execution of this skill.

## Instructions

${instructions}
`;
}

function main() {
  console.log("Generating Agent Skills from prompts content...");

  for (const prompt of promptsContent) {
    const skillDir = join(SKILLS_DIR, prompt.name.replace(/_/g, "-"));
    mkdirSync(skillDir, { recursive: true });

    const skillMd = generateSkillMd(
      prompt.name,
      prompt.description,
      prompt.skillInstructions
    );

    const skillPath = join(skillDir, "SKILL.md");
    writeFileSync(skillPath, skillMd, "utf-8");
    console.log(`  ✓ Generated ${skillPath}`);
  }

  console.log(`\nGenerated ${promptsContent.length} skills successfully.`);
}

main();
