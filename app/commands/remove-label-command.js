import { removeLabelMatcher } from "../matchers.js";
import { removeLabelEnabled } from "../command-enabled.js";
import { removeLabel } from "../github.js";
import { Command } from "./command.js";
import { extractCommaSeparated } from "../converters.js";
import { getLogger } from "../logger.js";

const classLogger = getLogger("commands/remove-label-command");

export class RemoveLabelCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return removeLabelMatcher(this.payload.comment.body);
  }

  enabled(config) {
    const removeLabels = extractCommaSeparated(this.matches()[1]);
    return removeLabelEnabled(config, removeLabels);
  }

  async run(authToken) {
    const sourceRepo = this.payload.repository.name;
    const labels = extractCommaSeparated(this.matches()[1]);

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    logger.info(
      `Removing label(s) from issue ${this.payload.issue.html_url}, labels ${labels}`
    );
    await removeLabel(
      authToken,
      this.payload.repository.owner.login,
      sourceRepo,
      this.payload.issue.node_id,
      labels
    );
  }
}
