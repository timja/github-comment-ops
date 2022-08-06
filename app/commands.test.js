import { getCommands } from "./commands.js";

describe("commands", () => {
  test("getCommands is empty when nothing matches", () => {
    const commands = getCommands("any", {
      comment: {
        body: "nothing that would every match",
      },
    });

    expect(commands).toHaveLength(0);
  });

  test("getCommands is not empty when something matches", () => {
    const commands = getCommands("any", {
      comment: {
        body: "/label one",
      },
    });

    expect(commands.length === 0).toEqual(false);
  });
  test("getCommands is not empty when multiple matches", () => {
    const commands = getCommands("any", {
      comment: {
        body: "/label one \n/reviewer reviewer",
      },
    });

    expect(commands).toHaveLength(2);
  });
});
