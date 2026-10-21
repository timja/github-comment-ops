const enabled = {
  enabled: true,
};

const orgMemberAssociations = new Set(["MEMBER", "OWNER"]);

function notEnabled(command) {
  return {
    enabled: false,
    error: `The \`${command}\` command is not enabled for this repository`,
  };
}

function invalidPermission(command, permission) {
  return {
    enabled: false,
    error: `The \`${command}\` command has an unsupported permission level \`${permission}\``,
  };
}

function notPermitted(command) {
  return {
    enabled: false,
    error: `The \`${command}\` command is restricted to organization members`,
  };
}

function trimLabels(labels) {
  return labels.map((it) => it.trim());
}

function permissionEnabled(command, commandConfig, authorAssociation) {
  const permission = commandConfig.permission ?? "all";

  if (permission === "all") {
    return enabled;
  }

  if (permission === "member") {
    return orgMemberAssociations.has(authorAssociation)
      ? enabled
      : notPermitted(command);
  }

  return invalidPermission(command, permission);
}

export function transferEnabled(config, authorAssociation) {
  const transferConfig = config.commands.transfer;

  if (!transferConfig.enabled) {
    return notEnabled("transfer");
  }

  return permissionEnabled("transfer", transferConfig, authorAssociation);
}

export function labelEnabled(config, labels, authorAssociation) {
  const labelConfig = config.commands.label;

  if (!labelConfig.enabled) {
    return notEnabled("label");
  }

  const permissionResult = permissionEnabled(
    "label",
    labelConfig,
    authorAssociation,
  );
  if (!permissionResult.enabled) {
    return permissionResult;
  }

  const allowedLabels = trimLabels(labelConfig.allowedLabels);
  if (
    // if length is = 0 then all labels are allowed
    allowedLabels.length > 0 &&
    !labels.every((label) => allowedLabels.includes(label))
  ) {
    return {
      enabled: false,
      error: `${labels} doesn't match the allowed labels \`${allowedLabels.join(
        ",",
      )}\``,
    };
  }

  return enabled;
}

export function closeEnabled(config, authorAssociation) {
  const closeConfig = config.commands.close;

  if (!closeConfig.enabled) {
    return notEnabled("close");
  }

  return permissionEnabled("close", closeConfig, authorAssociation);
}

export function reopenEnabled(config, authorAssociation) {
  const reopenConfig = config.commands.reopen;

  if (!reopenConfig.enabled) {
    return notEnabled("reopen");
  }

  return permissionEnabled("reopen", reopenConfig, authorAssociation);
}

export function removeLabelEnabled(config, labels, authorAssociation) {
  const labelConfig = config.commands.removeLabel;
  if (!labelConfig.enabled) {
    return notEnabled("remove-label");
  }

  const permissionResult = permissionEnabled(
    "remove-label",
    labelConfig,
    authorAssociation,
  );
  if (!permissionResult.enabled) {
    return permissionResult;
  }

  const allowedLabels = trimLabels(labelConfig.allowedLabels);
  if (
    // if length is = 0 then all labels are allowed
    allowedLabels.length > 0 &&
    !labels.every((label) => allowedLabels.includes(label))
  ) {
    return {
      enabled: false,
      error: `${labels} doesn't match the allowed labels \`${allowedLabels.join(
        ",",
      )}\``,
    };
  }

  return enabled;
}

export function reviewerEnabled(config, authorAssociation) {
  const reviewerConfig = config.commands.reviewer;

  if (!reviewerConfig.enabled) {
    return notEnabled("reviewer");
  }

  return permissionEnabled("reviewer", reviewerConfig, authorAssociation);
}
