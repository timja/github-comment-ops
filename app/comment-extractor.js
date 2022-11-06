export function extractBody(payload) {
  if (payload.review) {
    return payload.review.body;
  }
  return payload.comment.body;
}

export function extractHtmlUrl(payload) {
  if (payload.review) {
    return payload.pull_request.html_url;
  }
  return payload.issue.html_url;
}

export function extractLabelableId(payload) {
  if (payload.review) {
    return payload.pull_request.node_id;
  }

  return payload.issue.node_id;
}
