import { createServer } from "node:http";

import { createNodeStremioHandler } from "@addon-pass/sdk";

import { ADDON_ID, ADDON_NAME, respond } from "./addon.js";

/**
 * Every addon route lives under /addonpass/{token}/... and runs only for a
 * paying subscriber. /manifest.json without a token answers 404, and
 * /healthz is the only public route.
 */
export function createAddonServer({ managementUrl, verifier }) {
  const protectedAddon = createNodeStremioHandler({
    access: { addonId: ADDON_ID, addonName: ADDON_NAME, managementUrl },
    verifier,
    // The token is already checked and removed from the path here.
    upstream: (_request, authorization) => respond(authorization.route),
  });

  return createServer((request, response) => {
    if (request.url === "/healthz") {
      response.setHeader("content-type", "application/json");
      response.end('{"status":"ok"}');
      return;
    }
    void protectedAddon(request, response);
  });
}
