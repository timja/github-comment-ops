import {
  closeMatcher,
  labelMatcher,
  removeLabelMatcher,
  reopenMatcher,
  reviewerMatcher,
  transferMatcher,
} from "./matchers.js";
import {
  closeEnabled,
  labelEnabled,
  removeLabelEnabled,
  reopenEnabled,
  reviewerEnabled,
  transferEnabled,
} from "./command-enabled.js";
import {
  addLabel,
  closeIssue,
  removeLabel,
  reopenIssue,
  requestReviewers,
  transferIssue,
} from "./github.js";
import { extractCommaSeparated, extractUsersAndTeams } from "./converters.js";

function actorRequest(payload) {
  return `as requested by ${payload.sender.login}`;
}

export function getCommands(commentBody) {
  return {
    transfer: {
      matches: transferMatcher(commentBody),
      enabled: (config, octokit) => transferEnabled(octokit, config),
      run: async (id, payload, authToken, matches) => {
        const targetRepo = matches[1];
        const sourceRepo = payload.repository.name;
        console.log(
          `${id} Transferring issue ${
            payload.issue.html_url
          } to repo ${targetRepo} ${actorRequest(payload)}`
        );
        await transferIssue(
          authToken,
          payload.repository.owner.login,
          sourceRepo,
          targetRepo,
          payload.issue.node_id
        );
      },
    },
    close: {
      matches: closeMatcher(commentBody),
      enabled: (config, octokit) => closeEnabled(config, octokit),
      run: async (id, payload, authToken, closeMatches) => {
        const sourceRepo = payload.repository.name;
        const reason =
          closeMatches.length > 1 && closeMatches[1] === "not-planned"
            ? "NOT_PLANNED"
            : "COMPLETED";
        console.log(
          `${id} Closing issue ${
            payload.issue.html_url
          }, reason: ${reason} ${actorRequest(payload)}`
        );
        await closeIssue(authToken, sourceRepo, payload.issue.node_id, reason);
      },
    },
    reopen: {
      matches: reopenMatcher(commentBody),
      enabled: (config, octokit) => reopenEnabled(config, octokit),
      run: async (id, payload, authToken) => {
        const sourceRepo = payload.repository.name;
        console.log(
          `${id} Re-opening issue ${payload.issue.html_url} ${actorRequest(
            payload
          )}`
        );
        await reopenIssue(authToken, sourceRepo, payload.issue.node_id);
      },
    },
    label: {
      matches: labelMatcher(commentBody),
      enabled: (octokit, config, matches) => {
        const labels = extractCommaSeparated(matches[1]);
        return labelEnabled(octokit, config, labels);
      },
      run: async (id, payload, authToken, matches) => {
        const labels = extractCommaSeparated(matches[1]);
        const sourceRepo = payload.repository.name;

        console.log(
          `${id} Labeling issue ${
            payload.issue.html_url
          } with labels ${labels} ${actorRequest(payload)}`
        );
        await addLabel(
          authToken,
          payload.repository.owner.login,
          sourceRepo,
          payload.issue.node_id,
          labels
        );
      },
    },
    removeLabel: {
      matches: removeLabelMatcher(commentBody),
      enabled: (config, octokit, matches) => {
        const labels = extractCommaSeparated(matches[1]);
        return removeLabelEnabled(config, octokit, labels);
      },
      run: async (id, payload, authToken, matches) => {
        const sourceRepo = payload.repository.name;
        const labels = extractCommaSeparated(matches[1]);
        console.log(
          `${id} Removing label(s) from issue ${
            payload.issue.html_url
          }, labels ${labels} ${actorRequest(payload)}`
        );
        await removeLabel(
          authToken,
          payload.repository.owner.login,
          sourceRepo,
          payload.issue.node_id,
          labels
        );
      },
    },
    reviewer: {
      matches: reviewerMatcher(commentBody),
      enabled: (config, octokit) => reviewerEnabled(config, octokit),
      run: async (id, payload, authToken, matches) => {
        const reviewerMatches = matches[1];
        const sourceRepo = payload.repository.name;
        console.log(
          `${id} Requesting review for ${reviewerMatches} at ${
            payload.issue.html_url
          } ${actorRequest(payload)}`
        );
        const reviewers = extractUsersAndTeams(
          payload.repository.owner.login,
          reviewerMatches
        );
        await requestReviewers(
          authToken,
          payload.repository.owner.login,
          sourceRepo,
          payload.issue.node_id,
          reviewers.users,
          reviewers.teams
        );
      },
    },
  };
}

export function noneMatch(commands) {
  return !Object.values(commands).some((command) => command.matches);
}
