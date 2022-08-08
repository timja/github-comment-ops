import { reviewerMatcher } from "../matchers.js";
import { reviewerEnabled } from "../command-enabled.js";
import { requestReviewers } from "../github.js";
import { Command } from "./command.js";
import { extractUsersAndTeams } from "../converters.js";
import { getLogger } from "../logger.js";

const classLogger = getLogger("commands/reviewer-command");

export class ReviewerCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return reviewerMatcher(this.payload.comment.body);
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
      `Requesting review for ${reviewerMatches} at ${this.payload.issue.html_url}`
    );
    const reviewers = extractUsersAndTeams(
      this.payload.repository.owner.login,
      reviewerMatches
    );
    await requestReviewers(
      authToken,
      this.payload.repository.owner.login,
      sourceRepo,
      this.payload.issue.node_id,
      reviewers.users,
      reviewers.teams
    );
  }
}
