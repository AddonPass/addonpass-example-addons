# Donation addon

A free Stremio addon with a donation option. Anyone can install it for free. People who donate get a donor version as a thank-you.

AddonPass has no donate button, so the donation is a one-time plan: a donor pays once, nothing renews, and their install link never expires.

Both versions run on the same domain:

| Request                                                    | Result                                 |
| ---------------------------------------------------------- | -------------------------------------- |
| `/manifest.json` and the catalog and stream routes         | Free version, public                   |
| `/addonpass/{token}/manifest.json` and the routes under it | Donor version, for someone who donated |
| `/addonpass/manifest.json` or an unknown token             | `404`                                  |
| `/assets/*`, `/healthz`                                    | Public                                 |

The donor version has its own `id`, `name`, `logo`, and `background` in its manifest, so the two look different in Stremio, and it adds a 720p stream. Its logo also appears on the AddonPass checkout page.

- [`src/addon.js`](src/addon.js) builds either version.
- [`src/server.js`](src/server.js) serves the free version openly and puts the AddonPass check in front of the donor version.
- [`src/main.js`](src/main.js) reads the settings and starts the server.

## Try it locally

```sh
npm install
npm test
```

## Take donations

1. Deploy this folder somewhere with a public `https://` address, set `PUBLIC_URL` to that address, and run `npm start`.
2. Open the [AddonPass dashboard](https://addonpass.com/dashboard/get-started), sign in with your wallet, and register as a developer. Use the Test switch at the top to try it with test money first.
3. Add the donor version as your addon. The server URL ends in `/addonpass`, because that is where the donor version lives:

   | Field                 | Value                                                 |
   | --------------------- | ----------------------------------------------------- |
   | Addon server URL      | `https://your-domain/addonpass`                       |
   | Install link template | `https://your-domain/addonpass/{token}/manifest.json` |

4. Create an API credential. It is shown once. Put it in `ADDONPASS_INTEGRATION_CREDENTIAL` and restart the server.
5. Run the integration test in the dashboard. It checks that `/addonpass/manifest.json` is blocked and that a donor gets in. It costs 1 USDC, which comes back to your AddonPass balance minus the fee.
6. Create a plan and choose **One time** as the billing period. The amount is fixed, so create one plan for each amount you want to offer, for example 3, 10, and 25 USDC.
7. Put every plan ID in `ADDONPASS_ALLOWED_PLAN_IDS`, separated by commas, and restart. A plan that is not on the list is refused.
8. Share the checkout links wherever you would put a donate button.

Payments are final and AddonPass cannot issue refunds. Each payment lands in your AddonPass balance minus the AddonPass fee.

## Settings

| Variable                           | Value                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `ADDONPASS_API_URL`                | `https://api.addonpass.com`                                                |
| `ADDONPASS_INTEGRATION_CREDENTIAL` | The credential from step 4. Keep it secret.                                |
| `ADDONPASS_ALLOWED_PLAN_IDS`       | Comma-separated plan IDs. Empty lets only the integration test in.         |
| `ADDONPASS_MANAGEMENT_URL`         | `https://addonpass.com/subscriptions`, where donors see their purchase.    |
| `PUBLIC_URL`                       | Your `https://` address. The manifests use it for the logo and background. |
| `PORT`                             | Defaults to `7000`.                                                        |

## Make it yours

Replace the manifest and handlers in `src/addon.js` and the images in `public/`. Decide what donors get: a different look is enough, an extra like higher quality is a nice thank-you.
