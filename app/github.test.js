import { hasCommitterAccess } from "./github.js";

describe("github", () => {
  describe("hasCommitterAccess", () => {
    test("returns true when source permission is write", () => {
      const result = hasCommitterAccess("WRITE", "READ");

      expect(result).toBeTruthy();
    });

    test("returns true when target permission is maintain", () => {
      const result = hasCommitterAccess("READ", "MAINTAIN");

      expect(result).toBeTruthy();
    });

    test("returns true when target permission is admin", () => {
      const result = hasCommitterAccess("READ", "ADMIN");

      expect(result).toBeTruthy();
    });

    test("returns false when neither side has committer access", () => {
      const result = hasCommitterAccess("TRIAGE", "READ");

      expect(result).toBeFalsy();
    });
  });
});
