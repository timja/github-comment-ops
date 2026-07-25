import { hasCommitterAccess, hasTransferAccess } from "./github.js";

describe("github", () => {
  describe("hasCommitterAccess", () => {
    test("returns true when source permission is write", () => {
      const result = hasCommitterAccess("WRITE", "READ", false);

      expect(result).toBeTruthy();
    });

    test("returns true when target permission is maintain", () => {
      const result = hasCommitterAccess("READ", "MAINTAIN", false);

      expect(result).toBeTruthy();
    });

    test("returns true when target permission is admin", () => {
      const result = hasCommitterAccess("READ", "ADMIN", false);

      expect(result).toBeTruthy();
    });

    test("returns false when neither side has committer access", () => {
      const result = hasCommitterAccess("TRIAGE", "READ", false);

      expect(result).toBeFalsy();
    });

    test("returns true when triage is enabled and source has triage", () => {
      const result = hasCommitterAccess("TRIAGE", "READ", true);

      expect(result).toBeTruthy();
    });
  });

  describe("hasTransferAccess", () => {
    test("returns true when allowed by team", () => {
      const result = hasTransferAccess("READ", "READ", false, true);

      expect(result).toBeTruthy();
    });

    test("returns false when no repository permission and no team access", () => {
      const result = hasTransferAccess("READ", "READ", false, false);

      expect(result).toBeFalsy();
    });
  });
});
