# Subscription addon

A Stremio addon where everything is paid. Subscribers get a private install link, and the addon works for as long as their subscription is paid.

| Request                                                                       | Result                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------- |
| `/addonpass/{token}/manifest.json` and the catalog and stream routes under it | The addon, for an active subscriber       |
| The same routes with an expired subscription                                  | Valid Stremio JSON that points to renewal |
| `/manifest.json` or any route without a token                                 | `404`                                     |
| `/healthz`                                                                    | `200`, the only public route              |

- [`src/addon.js`](src/addon.js) is the addon: a manifest, one catalog, one stream.
- [`src/server.js`](src/server.js) puts the AddonPass check in front of it.
- [`src/main.js`](src/main.js) reads the settings and starts the server.

## Try it locally

```sh
npm install
npm test
```

## Take payments

1. Deploy this folder somewhere with a public `https://` address and run `npm start`.
2. Open the [AddonPass dashboard](https://addonpass.com/dashboard/get-started), sign in with your wallet, and register as a developer. Use the Test switch at the top to try it with test money first.
3. Add your addon with these two addresses:

   | Field                 | Value                                                 |
   | --------------------- | ----------------------------------------------------- |
   | Addon server URL      | `https://your-domain`                                 |
   | Install link template | `https://your-domain/addonpass/{token}/manifest.json` |

4. Create an API credential. It is shown once. Put it in `ADDONPASS_INTEGRATION_CREDENTIAL` and restart the server.
5. Run the integration test in the dashboard. It checks that `/manifest.json` is blocked and that a paying subscriber gets in. It costs 1 USDC, which comes back to your AddonPass balance minus the fee.
6. Create a plan: a price in USDC, billed every 30 days or every year. Put its plan ID in `ADDONPASS_ALLOWED_PLAN_IDS` and restart.
7. Share the plan's checkout link. Subscribers pay there and get their install link.

## Settings

| Variable                           | Value                                                              |
| ---------------------------------- | ------------------------------------------------------------------ |
| `ADDONPASS_API_URL`                | `https://api.addonpass.com`                                        |
| `ADDONPASS_INTEGRATION_CREDENTIAL` | The credential from step 4. Keep it secret.                        |
| `ADDONPASS_ALLOWED_PLAN_IDS`       | Comma-separated plan IDs. Empty lets only the integration test in. |
| `ADDONPASS_MANAGEMENT_URL`         | `https://addonpass.com/subscriptions`, where subscribers renew.    |
| `PORT`                             | Defaults to `7000`.                                                |

## Make it yours

Replace `src/addon.js` with your own manifest and handlers. Keep every Stremio route behind the handler in `src/server.js`, and do not serve the same addon on another path, port, or hostname.
