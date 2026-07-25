import { TransferCommand } from "./commands/transfer-command.js";
import { CloseCommand } from "./commands/close-command.js";
import { ReopenCommand } from "./commands/reopen-command.js";
import { LabelCommand } from "./commands/label-command.js";
import { RemoveLabelCommand } from "./commands/remove-label-command.js";
import { ReviewerCommand } from "./commands/reviewer-command.js";
import { HelpCommand } from "./commands/help-command.js";

export const ALL_COMMANDS = [
  TransferCommand,
  CloseCommand,
  ReopenCommand,
  LabelCommand,
  RemoveLabelCommand,
  ReviewerCommand,
  HelpCommand,
];

export function getCommands(id, payload) {
  const commands = ALL_COMMANDS.map((Cls) => new Cls(id, payload));
  const helpCommand = commands.find((c) => c instanceof HelpCommand);
  if (helpCommand) {
    helpCommand.allCommandClasses = ALL_COMMANDS;
  }
  return commands.filter((command) => command.matches());
}
