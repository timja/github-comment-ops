import {
  closeEnabled,
  labelEnabled,
  removeLabelEnabled,
  reopenEnabled,
  reviewerEnabled,
  transferEnabled,
} from "./command-enabled.js";

describe("command-enabled", () => {
  describe("permission levels", () => {
    test("defaults to all permissions when not configured", () => {
      const sut = closeEnabled(
        {
          commands: {
            close: {
              enabled: true,
            },
          },
        },
        "CONTRIBUTOR",
      );

      expect(sut.enabled).toEqual(true);
    });

    test.each([
      [
        "transfer",
        () =>
          transferEnabled(
            {
              commands: {
                transfer: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "MEMBER",
          ),
      ],
      [
        "close",
        () =>
          closeEnabled(
            {
              commands: {
                close: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "MEMBER",
          ),
      ],
      [
        "reopen",
        () =>
          reopenEnabled(
            {
              commands: {
                reopen: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "MEMBER",
          ),
      ],
      [
        "label",
        () =>
          labelEnabled(
            {
              commands: {
                label: {
                  enabled: true,
                  permission: "member",
                  allowedLabels: [],
                },
              },
            },
            ["label1"],
            "MEMBER",
          ),
      ],
      [
        "remove-label",
        () =>
          removeLabelEnabled(
            {
              commands: {
                removeLabel: {
                  enabled: true,
                  permission: "member",
                  allowedLabels: [],
                },
              },
            },
            ["label1"],
            "MEMBER",
          ),
      ],
      [
        "reviewer",
        () =>
          reviewerEnabled(
            {
              commands: {
                reviewer: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "MEMBER",
          ),
      ],
    ])("allows organization members to use %s", (_, sutFactory) => {
      expect(sutFactory().enabled).toEqual(true);
    });

    test("allows organization owners to use member-only commands", () => {
      const sut = reviewerEnabled(
        {
          commands: {
            reviewer: {
              enabled: true,
              permission: "member",
            },
          },
        },
        "OWNER",
      );

      expect(sut.enabled).toEqual(true);
    });

    test.each([
      [
        "transfer",
        () =>
          transferEnabled(
            {
              commands: {
                transfer: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "CONTRIBUTOR",
          ),
      ],
      [
        "close",
        () =>
          closeEnabled(
            {
              commands: {
                close: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "CONTRIBUTOR",
          ),
      ],
      [
        "reopen",
        () =>
          reopenEnabled(
            {
              commands: {
                reopen: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "CONTRIBUTOR",
          ),
      ],
      [
        "label",
        () =>
          labelEnabled(
            {
              commands: {
                label: {
                  enabled: true,
                  permission: "member",
                  allowedLabels: [],
                },
              },
            },
            ["label1"],
            "CONTRIBUTOR",
          ),
      ],
      [
        "remove-label",
        () =>
          removeLabelEnabled(
            {
              commands: {
                removeLabel: {
                  enabled: true,
                  permission: "member",
                  allowedLabels: [],
                },
              },
            },
            ["label1"],
            "CONTRIBUTOR",
          ),
      ],
      [
        "reviewer",
        () =>
          reviewerEnabled(
            {
              commands: {
                reviewer: {
                  enabled: true,
                  permission: "member",
                },
              },
            },
            "CONTRIBUTOR",
          ),
      ],
    ])(
      "blocks non-members from using %s when permission is member",
      (command, sutFactory) => {
        const sut = sutFactory();

        expect(sut).toEqual({
          enabled: false,
          error: `The \`${command}\` command is restricted to organization members`,
        });
      },
    );
  });

  describe("transferEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = transferEnabled({
        commands: {
          transfer: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = transferEnabled({
        commands: {
          transfer: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });

  describe("labelEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: [],
            },
          },
        },
        ["label1"],
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: false,
              allowedLabels: [],
            },
          },
        },
        ["label1"],
      );

      expect(sut.enabled).toEqual(false);
    });

    test("is enabled when label is in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label1"],
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when label is not in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label4"],
      );

      expect(sut.enabled).toEqual(false);
    });
    test("is enabled when all labels are in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label3", "label1", "label2"],
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when not all labels are in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label2", "label1", "label5"],
      );

      expect(sut.enabled).toEqual(false);
    });
  });

  test("is enabled when label is in allowedLabels with blanks", () => {
    const sut = labelEnabled(
      {
        commands: {
          label: {
            enabled: true,
            allowedLabels: ["label2", "label1 "],
          },
        },
      },
      ["label1"],
    );

    expect(sut.enabled).toEqual(true);
  });

  describe("closeEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = closeEnabled({
        commands: {
          close: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = closeEnabled({
        commands: {
          close: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });
  describe("reopenEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = reopenEnabled({
        commands: {
          reopen: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = reopenEnabled({
        commands: {
          reopen: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });

  describe("removeLabelEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: [],
            },
          },
        },
        ["label1"],
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: false,
              allowedLabels: [],
            },
          },
        },
        ["label1"],
      );

      expect(sut.enabled).toEqual(false);
    });

    test("is enabled when label is in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label1"],
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when label is not in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label4"],
      );

      expect(sut.enabled).toEqual(false);
    });
    test("is enabled when all labels are in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label3", "label1", "label2"],
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when not all labels are in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label2", "label1", "label5"],
      );

      expect(sut.enabled).toEqual(false);
    });
  });

  describe("reviewerEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = reviewerEnabled({
        commands: {
          reviewer: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = reviewerEnabled({
        commands: {
          reviewer: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });
});
