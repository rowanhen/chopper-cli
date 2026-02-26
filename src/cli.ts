#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { bestCommand } from "./commands/best.js";
import { boundCommand } from "./commands/bound.js";
import { ddCommand } from "./commands/dd.js";
import { entriesCommand } from "./commands/entries.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const program = new Command();

program
  .name("chopper")
  .description("Cryptocurrency trade analysis CLI")
  .version(pkg.version);

program.addCommand(bestCommand);
program.addCommand(boundCommand);
program.addCommand(ddCommand);
program.addCommand(entriesCommand);

program.parse();
