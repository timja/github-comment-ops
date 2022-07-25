import {
  closeMatcher,
  labelMatcher,
  removeLabelMatcher,
  reopenMatcher,
  reviewerMatcher,
  transferMatcher,
} from "./matchers.js";
import {
  addLabel,
  closeIssue,
  removeLabel,
  reopenIssue,
  requestReviewers,
  transferIssue,
} from "./github.js";
import { getAuthToken } from "./auth.js";
import { extractUsersAndTeams } from "./converters.js";

export async function router(auth, id, payload, verbose) {
  const sourceRepo = payload.repository.name;
  const transferMatches = transferMatcher(payload.comment.body);
  const actorRequest = `as requested by ${payload.sender.login}`;
  if (transferMatches) {
    const targetRepo = transferMatches[1];
    console.log(
      `${id} Transferring issue ${payload.issue.html_url} to repo ${targetRepo} ${actorRequest}`
    );
    await transferIssue(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      targetRepo,
      payload.issue.node_id
    );
    return;
  }

  const closeMatches = closeMatcher(payload.comment.body);
  if (closeMatches) {
    const reason =
      closeMatches.length > 1 && closeMatches[1] === "not-planned"
        ? "NOT_PLANNED"
        : "COMPLETED";
    console.log(
      `${id} Closing issue ${payload.issue.html_url}, reason: ${reason} ${actorRequest}`
    );
    await closeIssue(
      await getAuthToken(auth, payload.installation.id),
      sourceRepo,
      payload.issue.node_id,
      reason
    );
    return;
  }

  const reopenMatches = reopenMatcher(payload.comment.body);
  if (reopenMatches) {
    console.log(
      `${id} Re-opening issue ${payload.issue.html_url} ${actorRequest}`
    );
    await reopenIssue(
      await getAuthToken(auth, payload.installation.id),
      sourceRepo,
      payload.issue.node_id
    );
    return;
  }

  const labelMatches = labelMatcher(payload.comment.body);
  if (labelMatches) {
    const labels = labelMatches[1].split(",");

    console.log(
      `${id} Labeling issue ${payload.issue.html_url} with labels ${labels} ${actorRequest}`
    );
    await addLabel(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      labels
    );
    return;
  }

  const removeLabelMatches = removeLabelMatcher(payload.comment.body);
  if (removeLabelMatches) {
    const labels = removeLabelMatches[1].split(",");

    console.log(
      `${id} Removing label(s) from issue ${payload.issue.html_url}, labels ${labels} ${actorRequest}`
    );
    await removeLabel(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      labels
    );
    return;
  }

  const reviewerMatches = reviewerMatcher(payload.comment.body);
  if (reviewerMatches) {
    console.log(
      `${id} Requesting review for ${reviewerMatches[1]} at ${payload.issue.html_url} ${actorRequest}`
    );
    const reviewers = extractUsersAndTeams(
      payload.repository.owner.login,
      reviewerMatches[1]
    );
    await requestReviewers(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      reviewers.users,
      reviewers.teams
    );
    return;
  }

  if (verbose) {
    console.log("No match for", payload.comment.body);
  }
}
