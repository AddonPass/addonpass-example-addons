import { readFileSync } from "node:fs";
import { createServer } from "node:http";

import { createNodeStremioHandler } from "@addon-pass/sdk";

import { createAddon, DONOR_ID, DONOR_NAME } from "./addon.js";

const ASSETS = new Map(
  ["free-logo.png", "donor-logo.png", "donor-background.png"].map((file) => [
    `/assets/${file}`,
    readFileSync(new URL(`../public/${file}`, import.meta.url)),
  ]),
);

// /catalog/movie/some-id.json, /stream/movie/some-id.json
const FREE_RESOURCE = /^\/(catalog|stream)\/([^/]+)\/([^/]+)\.json$/;

function freeRoute(pathname) {
  if (pathname === "/manifest.json") return { resource: "manifest" };
  const match = FREE_RESOURCE.exec(pathname);
  return match === null
    ? null
    : { resource: match[1], type: match[2], id: match[3] };
}

/**
 * Two versions on one domain:
 *
 *   /manifest.json                    free version, public
 *   /addonpass/{token}/manifest.json  donor version, needs a paid token
 *
 * /addonpass/manifest.json without a token answers 404. In AddonPass, the
 * addon server URL is https://your-domain/addonpass.
 */
export function createAddonServer({ managementUrl, publicUrl, verifier }) {
  const free = createAddon({ publicUrl, donor: false });
  const donor = createAddon({ publicUrl, donor: true });

  const donorVersion = createNodeStremioHandler({
    access: { addonId: DONOR_ID, addonName: DONOR_NAME, managementUrl },
    verifier,
    // The token is already checked and removed from the path here.
    upstream: (_request, authorization) => donor(authorization.route),
  });

  return createServer(async (request, response) => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");

    if (pathname === "/healthz") {
      response.setHeader("content-type", "application/json");
      response.end('{"status":"ok"}');
      return;
    }

    const asset = ASSETS.get(pathname);
    if (asset !== undefined) {
      response.setHeader("content-type", "image/png");
      response.end(asset);
      return;
    }

    // Donor version: AddonPass checks the token before the addon runs.
    if (pathname.startsWith("/addonpass/")) {
      void donorVersion(request, response);
      return;
    }

    // Free version: no check.
    const route = freeRoute(pathname);
    const result =
      route === null ? new Response(null, { status: 404 }) : free(route);
    response.writeHead(result.status, {
      "access-control-allow-origin": "*",
      "content-type": "application/json",
    });
    response.end(await result.text());
  });
}
