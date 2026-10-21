const enabled = {
  enabled: true,
};

function notEnabled(command) {
  return {
    enabled: false,
    error: `The \`${command}\` command is not enabled for this repository`,
  };
}

function trimLabels(labels = []) {
  return labels.map((it) => it.trim());
}

const privilegedAuthorAssociations = new Set([
  "COLLABORATOR",
  "MEMBER",
  "OWNER",
]);

function protectedLabelEnabled(labelConfig, labels, authorAssociation) {
  const protectedLabels = trimLabels(labelConfig.protectedLabels);
  const protectedRequestedLabels = labels.filter((label) =>
    protectedLabels.includes(label),
  );
  if (protectedRequestedLabels.length === 0) {
    return enabled;
  }

  if (privilegedAuthorAssociations.has(authorAssociation)) {
    return enabled;
  }

  return {
    enabled: false,
    error: `${protectedRequestedLabels.join(",")} are protected labels and can only be modified by repository collaborators`,
  };
}

export function transferEnabled(config) {
  if (!config.commands.transfer.enabled) {
    return notEnabled("transfer");
  }

  return enabled;
}

export function labelEnabled(config, labels, authorAssociation) {
  const labelConfig = config.commands.label;

  if (!labelConfig.enabled) {
    return notEnabled("label");
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

  return protectedLabelEnabled(labelConfig, labels, authorAssociation);
}

export function closeEnabled(config) {
  if (!config.commands.close.enabled) {
    return notEnabled("close");
  }

  return enabled;
}

export function reopenEnabled(config) {
  if (!config.commands.reopen.enabled) {
    return notEnabled("reopen");
  }

  return enabled;
}

export function removeLabelEnabled(config, labels, authorAssociation) {
  const labelConfig = config.commands.removeLabel;
  if (!labelConfig.enabled) {
    return notEnabled("remove-label");
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

  return protectedLabelEnabled(labelConfig, labels, authorAssociation);
}

export function reviewerEnabled(config) {
  if (!config.commands.reviewer.enabled) {
    return notEnabled("reviewer");
  }

  return enabled;
}
