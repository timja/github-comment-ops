export function extractBody(payload) {
  if (payload.review) {
    return payload.review.body;
  }

  if (payload.pull_request) {
    return payload.pull_request.body;
  }

  return payload.comment.body;
}

export function extractHtmlUrl(payload) {
  if (payload.pull_request) {
    return payload.pull_request.html_url;
  }

  return payload.issue.html_url;
}

export function extractLabelableId(payload) {
  if (payload.pull_request) {
    return payload.pull_request.node_id;
  }

  return payload.issue.node_id;
}

export function extractAuthorAssociation(payload) {
  if (payload.review) {
    return payload.review.author_association;
  }

  if (payload.comment) {
    return payload.comment.author_association;
  }

  return payload.pull_request?.author_association;
}
