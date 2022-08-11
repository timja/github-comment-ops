import { addReaction, reportError } from "./github.js";
import { getAuthToken } from "./auth.js";
import { defaultConfig } from "./default-config.js";

import { Octokit } from "@octokit/core";
import { config as octoKitConfig } from "@probot/octokit-plugin-config";

import deepmerge from "deepmerge";
import { getCommands } from "./commands.js";

const OctokitConfig = Octokit.plugin(octoKitConfig);

import { getLogger } from "./logger.js";

const classLogger = getLogger("router");

export async function router(auth, id, payload, verbose) {
  const logger = classLogger.child({ user: payload.sender.login, id });

  const commands = getCommands(id, payload);

  if (commands.length === 0) {
    if (verbose) {
      logger.info(`No match for "${payload.comment.body}"`);
    }
    return;
  }

  const authToken = await getAuthToken(auth, payload.installation.id);
  const octokit = new OctokitConfig({ auth: authToken });

  try {
    await addReaction(authToken, payload.comment.node_id, "THUMBS_UP");

    // TODO validate against schema
    // noinspection JSUnusedGlobalSymbols
    const { config } = await octokit.config.get({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      path: ".github/comment-ops.yml",
      defaults: (configs) => deepmerge.all([defaultConfig, ...configs]),
    });

    for (const command of commands) {
      const result = command.enabled(config);
      await (result.enabled
        ? command.run(authToken)
        : reportError(authToken, payload.issue.node_id, result.error));
    }
  } catch (error) {
    logger.error(error);
  }
}
