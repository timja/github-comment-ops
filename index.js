#!/usr/bin/env node
import { createServer } from "node:http";
import { createNodeMiddleware, Webhooks } from "@octokit/webhooks";
import { createAppAuth } from "@octokit/auth-app";

import { router } from "./app/router.js";

import { getLogger } from "./app/logger.js";

import fs from "node:fs/promises";

const verbose = process.env.VERBOSE === "true";

const secret = process.env.WEBHOOK_SECRET;
const port = Number.parseInt(process.env.PORT || "3000", 10);

const logger = getLogger("index");

const webhooks = new Webhooks({
  secret,
});

function getPrivateKey(key) {
  if (key.startsWith("file:")) {
    const filePath = key.replace("file:", "");
    return fs.readFile(filePath, { encoding: "utf8" });
  }

  return key;
}

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: await getPrivateKey(process.env.GITHUB_APP_PRIVATE_KEY),
});

webhooks.on("issue_comment.created", async ({ id, payload }) => {
  await router(auth, id, payload, verbose);
});

webhooks.on("pull_request_review", async ({ id, payload }) => {
  await router(auth, id, payload, verbose);
});

createServer(
  createNodeMiddleware(webhooks, {
    // Return 200 for health probes
    onUnhandledRequest: (request, response) => {
      response.setHeader("Content-Type", "text/plain");
      response.write("For webhooks POST to path /api/github/webhooks\n");
      response.end();
    },
  })
).listen(port, () => {
  logger.info(`Listening for events on port ${port}`);
});
