import { helpMatcher } from "../matchers.js";
import { reportError } from "../github.js";
import { Command } from "./command.js";
import { getLogger } from "../logger.js";
import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";
import { ALL_COMMANDS } from "../commands.js";

const classLogger = getLogger("commands/help-command");

function buildHelpText(config) {
  const rows = ALL_COMMANDS.filter(
    (Cls) => !Cls.configKey || config.commands[Cls.configKey]?.enabled,
  )
    .map(
      (Cls) => `| \`${Cls.prototype.usage}\` | ${Cls.prototype.description} |`,
    )
    .join("\n");

  return `### Available Commands\n\n| Command | Description |\n| ------- | ----------- |\n${rows}`;
}

export class HelpCommand extends Command {
  get usage() {
    return "/help";
  }

  get description() {
    return "Show available commands";
  }

  matches() {
    return helpMatcher(extractBody(this.payload));
  }

  enabled(config) {
    this._config = config;
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
        buildHelpText(this._config),
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
