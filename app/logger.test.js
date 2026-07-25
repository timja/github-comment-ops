import { formatLogMessage } from "./logger.js";

describe("logger", () => {
  test("includes audit timestamp for user action logs", () => {
    const logOutput = formatLogMessage({
      level: "info",
      message: "audit event",
      label: "logger-test",
      timestamp: "2026-01-01T00:00:00.000Z",
      user: "audit-user",
      id: "audit-id",
    });

    expect(logOutput).toContain(
      "[audit-user] [audit-id] [2026-01-01T00:00:00.000Z] audit event",
    );
  });
});
