# AddonPass example addons

Two small Stremio addons that take payments through [AddonPass](https://addonpass.com). Each folder is a standalone Node project you can copy.

| Folder                                      | What it shows                                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`subscription-addon/`](subscription-addon) | A fully paid addon. Every route needs an active subscription (monthly or annual).         |
| [`donation-addon/`](donation-addon)         | A free addon with a donation option. A one-time payment unlocks a donor version for good. |

Both use [`@addon-pass/sdk`](https://github.com/AddonPass/addonpass-sdk) and nothing else.

## How it works

AddonPass hosts the checkout, takes the USDC payment on Base, and gives each paying customer a private install link:

```text
https://your-domain/addonpass/{token}/manifest.json
```

The SDK sits in front of your Stremio handlers. For every request it checks the token with AddonPass and only then runs your code. Without a valid token the handlers never run.

## Run an example

You need Node 22.14 or newer.

```sh
cd subscription-addon   # or donation-addon
npm install
npm test
cp .env.example .env    # then fill it in
npm start
```

The tests run without an AddonPass account. To take real or test payments, follow the README in the example's folder. You will need:

- a server with a public `https://` address, since AddonPass and Stremio both require it;
- an AddonPass developer account. Test mode is free: see [test mode](https://addonpass.com/docs/integration#test-mode) for the test USDC and ETH faucets.

## More

- [Integration guide](https://addonpass.com/docs/integration)
- [SDK](https://github.com/AddonPass/addonpass-sdk)

The sample video is Big Buck Bunny, © Blender Foundation, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The code is MIT licensed.
