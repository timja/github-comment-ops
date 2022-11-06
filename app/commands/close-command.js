import { Command } from "./command.js";
import { closeMatcher } from "../matchers.js";
import { closeEnabled } from "../command-enabled.js";
import { closeIssue } from "../github.js";
import { getLogger } from "../logger.js";
import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";

const classLogger = getLogger("commands/close-command");

export class CloseCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return closeMatcher(extractBody(this.payload));
  }

  enabled(config) {
    return closeEnabled(config);
  }

  async run(authToken) {
    const sourceRepo = this.payload.repository.name;
    const closeMatches = this.matches();
    const reason =
      closeMatches.length > 1 && closeMatches[1] === "not-planned"
        ? "NOT_PLANNED"
        : "COMPLETED";

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    if (this.payload.issue.pull_request) {
      logger.info("Not closing pull request");
      return;
    }

    logger.info(
      `Closing issue ${extractHtmlUrl(this.payload)}, reason: ${reason}`
    );
    try {
      await closeIssue(
        authToken,
        sourceRepo,
        extractLabelableId(this.payload),
        reason
      );
    } catch (error) {
      logger.error(
        `Failed to close issue ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error
      );
    }
  }
}
