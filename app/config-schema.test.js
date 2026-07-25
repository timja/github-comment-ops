import { validateConfig } from "./config-schema.js";
import { defaultConfig } from "./default-config.js";

describe("config-schema", () => {
  test("default config is valid", () => {
    expect(() => validateConfig(defaultConfig)).not.toThrow();
  });

  test("enabled label config with allowed labels is valid", () => {
    const config = structuredClone(defaultConfig);
    config.commands.label.enabled = true;
    config.commands.label.allowedLabels = ["bug", "help wanted"];

    expect(() => validateConfig(config)).not.toThrow();
  });

  test("throws when enabled is not a boolean", () => {
    const config = structuredClone(defaultConfig);
    config.commands.close.enabled = "true";

    expect(() => validateConfig(config)).toThrow("/commands/close/enabled");
  });

  test("throws when allowedLabels is not an array", () => {
    const config = structuredClone(defaultConfig);
    config.commands.label.allowedLabels = "bug";

    expect(() => validateConfig(config)).toThrow(
      "/commands/label/allowedLabels",
    );
  });

  test("throws when command config includes unknown properties", () => {
    const config = structuredClone(defaultConfig);
    config.commands.transfer.target = "repo";

    expect(() => validateConfig(config)).toThrow("/commands/transfer");
  });
});
