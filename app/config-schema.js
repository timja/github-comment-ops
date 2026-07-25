import Ajv2020 from "ajv/dist/2020.js";

const toggleCommandSchema = {
  additionalProperties: false,
  properties: {
    enabled: {
      type: "boolean",
    },
  },
  required: ["enabled"],
  type: "object",
};

const labelCommandSchema = {
  additionalProperties: false,
  properties: {
    allowedLabels: {
      items: {
        type: "string",
      },
      type: "array",
    },
    enabled: {
      type: "boolean",
    },
  },
  required: ["allowedLabels", "enabled"],
  type: "object",
};

export const configSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    commands: {
      additionalProperties: false,
      properties: {
        close: toggleCommandSchema,
        label: labelCommandSchema,
        removeLabel: labelCommandSchema,
        reopen: toggleCommandSchema,
        reviewer: toggleCommandSchema,
        transfer: toggleCommandSchema,
      },
      required: [
        "close",
        "label",
        "removeLabel",
        "reopen",
        "reviewer",
        "transfer",
      ],
      type: "object",
    },
  },
  required: ["commands"],
  type: "object",
};

const validator = new Ajv2020({
  allErrors: true,
}).compile(configSchema);

export function validateConfig(config) {
  if (validator(config)) {
    return;
  }

  throw new Error(
    validator.errors
      .map((error) => `${error.instancePath || "/"} ${error.message}`)
      .join("; "),
  );
}
