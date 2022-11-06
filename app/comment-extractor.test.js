import {
  extractBody,
  extractHtmlUrl,
  extractLabelableId,
} from "./comment-extractor.js";

describe("extractors", () => {
  describe("extractBody", () => {
    test("is a review", () => {
      expect(
        extractBody({
          review: {
            body: "review body",
          },
        })
      ).toEqual("review body");
    });

    test("is an issue", () => {
      expect(
        extractBody({
          comment: {
            body: "comment body",
          },
        })
      ).toEqual("comment body");
    });
  });

  describe("extractHtmlUrl", () => {
    test("is a review", () => {
      expect(
        extractHtmlUrl({
          review: {
            body: "review body",
          },
          pull_request: {
            html_url: "https://github.com/some-org/some-repo/pull/1",
          },
        })
      ).toEqual("https://github.com/some-org/some-repo/pull/1");
    });

    test("is an issue", () => {
      expect(
        extractHtmlUrl({
          issue: {
            html_url: "https://github.com/some-org/some-repo/issue/1",
          },
        })
      ).toEqual("https://github.com/some-org/some-repo/issue/1");
    });
  });

  describe("extractLabelableId", () => {
    test("is a review", () => {
      expect(
        extractLabelableId({
          review: {
            body: "review body",
          },
          pull_request: {
            node_id: "PR_aaaaaa",
          },
        })
      ).toEqual("PR_aaaaaa");
    });

    test("is an issue", () => {
      expect(
        extractLabelableId({
          issue: {
            node_id: "PR_abcdefgh",
          },
        })
      ).toEqual("PR_abcdefgh");
    });
  });
});
