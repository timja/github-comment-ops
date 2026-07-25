import { mergeConfigs } from "./router.js";
import { defaultConfig } from "./default-config.js";

describe("mergeConfigs", () => {
  test("returns default config when no org or repo config", () => {
    const orgFiles = [{ config: undefined }];
    const repoFiles = [{ config: undefined }];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    expect(result).toEqual(defaultConfig);
  });

  test("merges default and org config when only org config exists", () => {
    const orgFiles = [{ config: { commands: { close: { enabled: true } } } }];
    const repoFiles = [{ config: undefined }];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    expect(result.commands.close.enabled).toEqual(true);
    expect(result.commands.label.enabled).toEqual(false);
  });

  test("merges default and repo config when only repo config exists", () => {
    const orgFiles = [{ config: undefined }];
    const repoFiles = [{ config: { commands: { reopen: { enabled: true } } } }];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    expect(result.commands.reopen.enabled).toEqual(true);
    expect(result.commands.close.enabled).toEqual(false);
  });

  test("merges default, org, and repo configs when all exist", () => {
    const orgFiles = [
      {
        config: {
          commands: {
            close: { enabled: true },
            label: { enabled: true, allowedLabels: [] },
          },
        },
      },
    ];
    const repoFiles = [{ config: { commands: { reopen: { enabled: true } } } }];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    expect(result.commands.close.enabled).toEqual(true);
    expect(result.commands.label.enabled).toEqual(true);
    expect(result.commands.reopen.enabled).toEqual(true);
  });

  test("repo config overrides org config", () => {
    const orgFiles = [{ config: { commands: { close: { enabled: true } } } }];
    const repoFiles = [{ config: { commands: { close: { enabled: false } } } }];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    expect(result.commands.close.enabled).toEqual(false);
  });

  test("org config overrides default config", () => {
    const orgFiles = [
      {
        config: {
          commands: { label: { enabled: true, allowedLabels: ["bug"] } },
        },
      },
    ];
    const repoFiles = [{ config: undefined }];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    expect(result.commands.label.enabled).toEqual(true);
    expect(result.commands.label.allowedLabels).toEqual(["bug"]);
  });

  test("handles _extends chain in org files", () => {
    // When org config has _extends, plugin returns multiple files (base first, extending last)
    // compose-config-get reverses them so mergeConfigs receives them in this order
    const orgFiles = [
      { config: { commands: { close: { enabled: true } } } }, // org config
      {
        config: {
          commands: {
            close: { enabled: false },
            label: { enabled: true, allowedLabels: [] },
          },
        },
      }, // base extended config
    ];
    const repoFiles = [{ config: undefined }];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    // Extended config is first after reverse, org config overrides it
    expect(result.commands.close.enabled).toEqual(true);
    expect(result.commands.label.enabled).toEqual(true);
  });

  test("handles _extends chain in repo files", () => {
    const orgFiles = [{ config: undefined }];
    // repo config extends another config; plugin returns them with repo first, extended second
    const repoFiles = [
      { config: { commands: { reopen: { enabled: true } } } }, // repo config
      { config: { commands: { close: { enabled: true } } } }, // base extended config
    ];

    const result = mergeConfigs(defaultConfig, orgFiles, repoFiles);

    // extended config comes first after reverse, repo config overrides it
    expect(result.commands.reopen.enabled).toEqual(true);
    expect(result.commands.close.enabled).toEqual(true);
  });
});
