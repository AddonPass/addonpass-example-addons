import assert from "node:assert/strict";
import { after, test } from "node:test";

import { ADDON_ID } from "../src/addon.js";
import { createAddonServer } from "../src/server.js";

const TOKEN = Buffer.alloc(32, 7).toString("base64url");
const MANAGEMENT_URL = "https://addonpass.com/subscriptions";

// What AddonPass answers for a token; the real verifier fetches this.
let status = "active";
const verifier = {
  verifyToken: () =>
    Promise.resolve({
      cached: false,
      entitled: status === "active",
      finality: "safe",
      graceEnds: "2026-01-04T00:00:00.000Z",
      paidThrough: "2026-01-01T00:00:00.000Z",
      planId: "1",
      source: "api",
      sourceBlock: "1",
      sourceBlockHash: `0x${"11".repeat(32)}`,
      status,
      subscriptionId: "1",
    }),
};

const server = createAddonServer({ managementUrl: MANAGEMENT_URL, verifier });
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
after(() => server.close());

test("nothing is served without a token", async () => {
  assert.equal((await fetch(`${origin}/manifest.json`)).status, 404);
  assert.equal((await fetch(`${origin}/addonpass/manifest.json`)).status, 404);
  assert.equal(
    (await fetch(`${origin}/stream/movie/tt1254207.json`)).status,
    404,
  );
  assert.equal((await fetch(`${origin}/healthz`)).status, 200);
});

test("a subscriber gets the addon", async () => {
  status = "active";
  const manifest = await fetch(`${origin}/addonpass/${TOKEN}/manifest.json`);
  assert.equal(manifest.status, 200);
  assert.equal(manifest.headers.get("access-control-allow-origin"), "*");
  assert.equal((await manifest.json()).id, ADDON_ID);

  const stream = await fetch(
    `${origin}/addonpass/${TOKEN}/stream/movie/tt1254207.json`,
  );
  assert.equal((await stream.json()).streams.length, 1);
});

test("an expired subscriber gets a renewal notice, not the stream", async () => {
  status = "expired";
  const response = await fetch(
    `${origin}/addonpass/${TOKEN}/stream/movie/tt1254207.json`,
  );
  const body = await response.text();
  assert.match(body, /addonpass\.com\/subscriptions/);
  assert.doesNotMatch(body, /archive\.org/);
});

test("an unknown token is a plain 404", async () => {
  status = "not_found";
  const response = await fetch(`${origin}/addonpass/${TOKEN}/manifest.json`);
  assert.equal(response.status, 404);
});
