import { labelMatcher } from "../matchers.js";
import { labelEnabled } from "../command-enabled.js";
import { addLabel } from "../github.js";
import { Command } from "./command.js";
import { extractCommaSeparated } from "../converters.js";

import { getLogger } from "../logger.js";

const classLogger = getLogger("commands/label-command");

export class LabelCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return labelMatcher(this.payload.comment.body);
  }

  enabled(config) {
    const labels = extractCommaSeparated(this.matches()[1]);
    return labelEnabled(config, labels);
  }

  async run(authToken) {
    const labels = extractCommaSeparated(this.matches()[1]);
    const sourceRepo = this.payload.repository.name;

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    logger.info(
      `Labeling issue ${this.payload.issue.html_url} with labels ${labels}`
    );
    await addLabel(
      authToken,
      this.payload.repository.owner.login,
      sourceRepo,
      this.payload.issue.node_id,
      labels
    );
  }
}
