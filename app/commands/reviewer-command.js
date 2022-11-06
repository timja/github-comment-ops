import { reviewerMatcher } from "../matchers.js";
import { reviewerEnabled } from "../command-enabled.js";
import { requestReviewers } from "../github.js";
import { Command } from "./command.js";
import { extractUsersAndTeams } from "../converters.js";
import { getLogger } from "../logger.js";
import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";

const classLogger = getLogger("commands/reviewer-command");

export class ReviewerCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return reviewerMatcher(extractBody(this.payload));
  }

  enabled(config) {
    return reviewerEnabled(config);
  }

  async run(authToken) {
    const reviewerMatches = this.matches()[1];
    const sourceRepo = this.payload.repository.name;

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    logger.info(
      `Requesting review for ${reviewerMatches} at ${extractHtmlUrl(
        this.payload
      )}`
    );
    const reviewers = extractUsersAndTeams(
      this.payload.repository.owner.login,
      reviewerMatches
    );
    try {
      await requestReviewers(
        authToken,
        this.payload.repository.owner.login,
        sourceRepo,
        extractLabelableId(this.payload),
        reviewers.users,
        reviewers.teams
      );
    } catch (error) {
      logger.error(
        `Failed to request reviewer ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error
      );
    }
  }
}
