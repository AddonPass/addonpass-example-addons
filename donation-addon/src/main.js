import { AddonPassVerifier } from "@addon-pass/sdk";

import { createAddonServer } from "./server.js";

const {
  ADDONPASS_ALLOWED_PLAN_IDS = "",
  ADDONPASS_API_URL = "https://api.addonpass.com",
  ADDONPASS_INTEGRATION_CREDENTIAL,
  ADDONPASS_MANAGEMENT_URL = "https://addonpass.com/subscriptions",
  PORT = "7000",
  PUBLIC_URL = `http://127.0.0.1:${PORT}`,
} = process.env;

if (!ADDONPASS_INTEGRATION_CREDENTIAL) {
  console.error("Set ADDONPASS_INTEGRATION_CREDENTIAL (see .env.example).");
  process.exit(1);
}

const verifier = new AddonPassVerifier({
  // An empty list lets only the AddonPass integration test in. Every donation
  // amount is its own plan, so list all of their IDs.
  allowedPlanIds: ADDONPASS_ALLOWED_PLAN_IDS.split(",").map((id) => id.trim()),
  apiBaseUrl: ADDONPASS_API_URL,
  integrationCredential: ADDONPASS_INTEGRATION_CREDENTIAL,
});

createAddonServer({
  managementUrl: ADDONPASS_MANAGEMENT_URL,
  publicUrl: PUBLIC_URL.replace(/\/$/, ""),
  verifier,
}).listen(Number(PORT), () => {
  console.log(`Donation addon listening on port ${PORT}`);
});
