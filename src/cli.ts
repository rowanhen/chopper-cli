#!/usr/bin/env node

import { Command } from "commander";
import { bestCommand } from "./commands/best.js";
import { boundCommand } from "./commands/bound.js";
import { ddCommand } from "./commands/dd.js";

const program = new Command();

program
  .name("chopper")
  .description("Cryptocurrency trade analysis CLI")
  .version("0.1.0");

program.addCommand(bestCommand);
program.addCommand(boundCommand);
program.addCommand(ddCommand);

program.parse();
