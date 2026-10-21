import { labelMatcher } from "../matchers.js";
import { labelEnabled } from "../command-enabled.js";
import { addLabel } from "../github.js";
import { Command } from "./command.js";
import { extractCommaSeparated } from "../converters.js";

import { getLogger } from "../logger.js";
import {
  extractAuthorAssociation,
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";

const classLogger = getLogger("commands/label-command");

export class LabelCommand extends Command {
  static configKey = "label";

  constructor(id, payload) {
    super(id, payload);
  }

  get usage() {
    return "/label <label1,label2>";
  }

  get description() {
    return "Add labels to this issue or pull request";
  }

  matches() {
    return labelMatcher(extractBody(this.payload));
  }

  enabled(config) {
    const labels = extractCommaSeparated(this.matches()[1]);
    return labelEnabled(config, labels, extractAuthorAssociation(this.payload));
  }

  async run(authToken) {
    const labels = extractCommaSeparated(this.matches()[1]);
    const sourceRepo = this.payload.repository.name;

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    logger.info(
      `Labeling issue ${extractHtmlUrl(this.payload)} with labels ${labels}`,
    );
    try {
      await addLabel(
        authToken,
        this.payload.repository.owner.login,
        sourceRepo,
        extractLabelableId(this.payload),
        labels,
      );
    } catch (error) {
      logger.error(
        `Failed to add label ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error,
      );
    }
  }
}
