import assert from "node:assert/strict";
import { after, test } from "node:test";

import { DONOR_ID } from "../src/addon.js";
import { createAddonServer } from "../src/server.js";

const TOKEN = Buffer.alloc(32, 7).toString("base64url");

// What AddonPass answers for a token; the real verifier fetches this.
let status = "active";
const verifier = {
  verifyToken: () =>
    Promise.resolve({
      cached: false,
      entitled: status === "active",
      finality: "safe",
      graceEnds: null,
      paidThrough: "2126-01-01T00:00:00.000Z",
      planId: "1",
      source: "api",
      sourceBlock: "1",
      sourceBlockHash: `0x${"11".repeat(32)}`,
      status,
      subscriptionId: "1",
    }),
};

const server = createAddonServer({
  managementUrl: "https://addonpass.com/subscriptions",
  publicUrl: "https://addon.example.com",
  verifier,
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
after(() => server.close());

test("the free version is public", async () => {
  const manifest = await fetch(`${origin}/manifest.json`);
  assert.equal(manifest.status, 200);
  assert.equal(manifest.headers.get("access-control-allow-origin"), "*");
  const body = await manifest.json();
  assert.equal(body.id, "com.addonpass.example.donation");
  assert.equal(body.background, undefined);

  const stream = await fetch(`${origin}/stream/movie/tt1254207.json`);
  assert.equal((await stream.json()).streams.length, 1);

  const logo = await fetch(`${origin}/assets/free-logo.png`);
  assert.equal(logo.headers.get("content-type"), "image/png");
});

test("the donor version needs a paid token", async () => {
  assert.equal((await fetch(`${origin}/addonpass/manifest.json`)).status, 404);

  status = "not_found";
  const unknown = await fetch(`${origin}/addonpass/${TOKEN}/manifest.json`);
  assert.equal(unknown.status, 404);
});

test("a donor gets their own version with the extra stream", async () => {
  status = "active";
  const manifest = await (
    await fetch(`${origin}/addonpass/${TOKEN}/manifest.json`)
  ).json();
  assert.equal(manifest.id, DONOR_ID);
  assert.equal(
    manifest.logo,
    "https://addon.example.com/assets/donor-logo.png",
  );
  assert.equal(
    manifest.background,
    "https://addon.example.com/assets/donor-background.png",
  );

  const stream = await fetch(
    `${origin}/addonpass/${TOKEN}/stream/movie/tt1254207.json`,
  );
  assert.equal((await stream.json()).streams.length, 2);
});
