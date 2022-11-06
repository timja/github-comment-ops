import { labelMatcher } from "../matchers.js";
import { labelEnabled } from "../command-enabled.js";
import { addLabel } from "../github.js";
import { Command } from "./command.js";
import { extractCommaSeparated } from "../converters.js";

import { getLogger } from "../logger.js";
import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "../comment-extractor.js";

const classLogger = getLogger("commands/label-command");

export class LabelCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return labelMatcher(extractBody(this.payload));
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
      `Labeling issue ${extractHtmlUrl(this.payload)} with labels ${labels}`
    );
    try {
      await addLabel(
        authToken,
        this.payload.repository.owner.login,
        sourceRepo,
        extractLabelableId(this.payload),
        labels
      );
    } catch (error) {
      logger.error(
        `Failed to add label ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error
      );
    }
  }
}
