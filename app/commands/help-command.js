import { helpMatcher } from "../matchers.js";
import { reportError } from "../github.js";
import { Command } from "./command.js";
import { getLogger } from "../logger.js";
import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";

const classLogger = getLogger("commands/help-command");

const helpText = `### Available Commands

| Command | Description |
| ------- | ----------- |
| \`/label label1,label2\` | Add labels to this issue or pull request |
| \`/remove-label label1,label2\` | Remove labels from this issue or pull request |
| \`/close\` | Close this issue |
| \`/close not-planned\` | Close this issue as not planned |
| \`/reopen\` | Reopen this issue |
| \`/reviewer reviewer1,reviewer2\` | Request reviewers for this pull request |
| \`/transfer repo-name\` | Transfer this issue to another repository |
| \`/help\` | Show this help message |`;

export class HelpCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
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
      await reportError(authToken, extractLabelableId(this.payload), helpText);
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
