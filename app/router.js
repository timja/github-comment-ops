import { addReaction, reportError } from "./github.js";
import { getAuthToken } from "./auth.js";
import { validateConfig } from "./config-schema.js";
import { defaultConfig } from "./default-config.js";

import { Octokit } from "@octokit/core";
import { config as octoKitConfig } from "@probot/octokit-plugin-config";

import deepmerge from "deepmerge";
import { getCommands } from "./commands.js";

const OctokitConfig = Octokit.plugin(octoKitConfig);

import { getLogger } from "./logger.js";
import { extractLabelableId } from "./comment-extractor.js";

const classLogger = getLogger("router");

export async function router(auth, id, payload, verbose) {
  const logger = classLogger.child({ user: payload.sender.login, id });

  const commands = getCommands(id, payload);

  if (commands.length === 0) {
    if (verbose) {
      logger.info(
        `No match for "${payload?.pull_request?.body || payload.comment.body}"`,
      );
    }
    return;
  }

  const authToken = await getAuthToken(auth, payload.installation.id);
  const octokit = new OctokitConfig({ auth: authToken });

  try {
    await addReaction(authToken, getCommentNodeId(payload), "THUMBS_UP");
  } catch (error) {
    logger.error(
      `Failed to add reaction ${
        error.errors ? JSON.stringify(error.errors) : ""
      }`,
      error,
    );
  }

  try {
    // noinspection JSUnusedGlobalSymbols
    const owner = payload.repository.owner.login;
    const repoName = payload.repository.name;
    const configPath = ".github/comment-ops.yml";

    // Fetch org-level config from the .github repo
    const { files: orgFiles } = await octokit.config.get({
      owner,
      repo: ".github",
      path: configPath,
    });

    // Fetch repo-level config (files[0] is always the requested repo's file)
    const { files: repoFiles } = await octokit.config.get({
      owner,
      repo: repoName,
      path: configPath,
    });

    // Merge in order: default → org → repo
    const config = mergeConfigs(defaultConfig, orgFiles, repoFiles);
    validateConfig(config);

    for (const command of commands) {
      const result = command.enabled(config);
      await (result.enabled
        ? command.run(authToken)
        : reportError(authToken, extractLabelableId(payload), result.error));
    }
  } catch (error) {
    logger.error(error);
  }
}

function getCommentNodeId(payload) {
  if (payload.review) {
    return payload.review.node_id;
  }

  if (payload.pull_request) {
    return payload.pull_request.node_id;
  }

  return payload.comment.node_id;
}

export function mergeConfigs(defaults, orgFiles, repoFiles) {
  // Only use repo files if the repo has its own config, to avoid including
  // the org .github fallthrough that the plugin adds when no repo config exists
  const hasRepoConfig = !!repoFiles[0]?.config;

  const orgConfigs = orgFiles
    .map((f) => f.config)
    .filter(Boolean)
    .reverse();
  const repoConfigs = hasRepoConfig
    ? repoFiles
        .map((f) => f.config)
        .filter(Boolean)
        .reverse()
    : [];

  // Merge in order: default → org → repo
  return deepmerge.all([defaults, ...orgConfigs, ...repoConfigs]);
}
