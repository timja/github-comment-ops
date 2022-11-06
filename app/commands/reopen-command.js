import { reopenMatcher } from "../matchers.js";
import { reopenEnabled } from "../command-enabled.js";
import { reopenIssue } from "../github.js";
import { Command } from "./command.js";
import { getLogger } from "../logger.js";
import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";

const classLogger = getLogger("commands/reopen-command");

export class ReopenCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return reopenMatcher(extractBody(this.payload));
  }

  enabled(config) {
    return reopenEnabled(config);
  }

  async run(authToken) {
    const sourceRepo = this.payload.repository.name;

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    if (this.payload.issue.pull_request) {
      logger.info("Not re-opening pull request");
      return;
    }

    logger.info(`Re-opening issue ${extractHtmlUrl(this.payload)}`);

    try {
      await reopenIssue(
        authToken,
        sourceRepo,
        extractLabelableId(this.payload)
      );
    } catch (error) {
      logger.error(
        `Failed to reopen issue ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error
      );
    }
  }
}
