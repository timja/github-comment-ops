import { helpMatcher } from "../matchers.js";
import { reportError } from "../github.js";
import { Command } from "./command.js";
import { getLogger } from "../logger.js";
import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";
import { TransferCommand } from "./transfer-command.js";
import { CloseCommand } from "./close-command.js";
import { ReopenCommand } from "./reopen-command.js";
import { LabelCommand } from "./label-command.js";
import { RemoveLabelCommand } from "./remove-label-command.js";
import { ReviewerCommand } from "./reviewer-command.js";

const classLogger = getLogger("commands/help-command");

export class HelpCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  get usage() {
    return "/help";
  }

  get description() {
    return "Show available commands";
  }

  matches() {
    return helpMatcher(extractBody(this.payload));
  }

  // eslint-disable-next-line no-unused-vars
  enabled(config) {
    return {
      enabled: true,
    };
  }

  async run(authToken) {
    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    logger.info(`Showing help for ${extractHtmlUrl(this.payload)}`);
    try {
      await reportError(
        authToken,
        extractLabelableId(this.payload),
        buildHelpText(),
      );
    } catch (error) {
      logger.error(
        `Failed to post help comment ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error,
      );
    }
  }
}

// Defined after HelpCommand so the class is available for inclusion in the list.
const DOCUMENTED_COMMANDS = [
  TransferCommand,
  CloseCommand,
  ReopenCommand,
  LabelCommand,
  RemoveLabelCommand,
  ReviewerCommand,
  HelpCommand,
];

function buildHelpText() {
  const rows = DOCUMENTED_COMMANDS.map((CommandClass) => {
    const { usage, description } = CommandClass.prototype;
    return `| \`${usage}\` | ${description} |`;
  }).join("\n");

  return `### Available Commands\n\n| Command | Description |\n| ------- | ----------- |\n${rows}`;
}
