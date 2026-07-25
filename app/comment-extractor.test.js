import {
  extractAuthorAssociation,
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
        }),
      ).toEqual("review body");
    });

    test("is an issue", () => {
      expect(
        extractBody({
          comment: {
            body: "comment body",
          },
        }),
      ).toEqual("comment body");
    });

    test("is a pull request body", () => {
      expect(
        extractBody({
          pull_request: {
            body: "pull request body",
          },
        }),
      ).toEqual("pull request body");
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
        }),
      ).toEqual("https://github.com/some-org/some-repo/pull/1");
    });

    test("is an issue", () => {
      expect(
        extractHtmlUrl({
          issue: {
            html_url: "https://github.com/some-org/some-repo/issue/1",
          },
        }),
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
        }),
      ).toEqual("PR_aaaaaa");
    });

    test("is an issue", () => {
      expect(
        extractLabelableId({
          issue: {
            node_id: "PR_abcdefgh",
          },
        }),
      ).toEqual("PR_abcdefgh");
    });
  });

  describe("extractAuthorAssociation", () => {
    test("is a review", () => {
      expect(
        extractAuthorAssociation({
          review: {
            author_association: "MEMBER",
          },
        }),
      ).toEqual("MEMBER");
    });

    test("is an issue comment", () => {
      expect(
        extractAuthorAssociation({
          comment: {
            author_association: "OWNER",
          },
        }),
      ).toEqual("OWNER");
    });

    test("is a pull request", () => {
      expect(
        extractAuthorAssociation({
          pull_request: {
            author_association: "CONTRIBUTOR",
          },
        }),
      ).toEqual("CONTRIBUTOR");
    });
  });
});
