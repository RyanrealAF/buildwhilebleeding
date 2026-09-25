# BuildWhileBleeding Cloudflare Router

The umbrella repo now contains the Cloudflare Worker that will own buildwhilebleeding.com and route project paths to independent deployments.

## Public map

- / → BuildWhileBleeding shell in this repo
- /hardwire/* → RyanrealAF/Hardwire
- /library/seuss/* → RyanrealAF/Seuss
- /the-leak-report/* → RyanrealAF/Theleakreport
- /cartography/* → RyanrealAF/Cartography

The Worker strips the public mount before forwarding. /hardwire/foo is fetched from the Hardwire origin as /foo.

## Current deployment inventory

Hardwire already declares a Cloudflare Pages project named the-hardwire-method, so its current Pages origin is configured as:

https://the-hardwire-method.pages.dev

The Seuss and Cartography repositories are currently library/archive repositories rather than standard Vite applications. They need a concrete public deployment origin before their mounts can be enabled.

The Leak Report is a Vite + Express application. Its production build produces both the browser bundle and an Express server bundle, so it needs a Node-capable deployment origin rather than being assumed to be a static Pages site.

## Why the Worker exists

A Pages redirect would move the browser to another hostname. The Worker is instead a reverse proxy: the browser stays on buildwhilebleeding.com while the project apps remain independently developed and deployed.

No shared runtime, database, authentication layer, or monorepo is required.

## Before production

1. Build this repo with npm run build.
2. Deploy the Worker with Wrangler.
3. Set SEUSS_ORIGIN, LEAK_REPORT_ORIGIN, and CARTOGRAPHY_ORIGIN to real public deployment URLs.
4. Keep HARDWIRE_ORIGIN pointed at the live Hardwire Pages project.
5. Confirm /, every mount root, deep links, refreshes, static assets, query strings, and 404 behavior.
6. Confirm both apex and www resolve through the Worker.
7. Only then cut the DNS/route over from the existing Hardwire Pages site.

Do not remove the existing Hardwire deployment until the new router passes the full smoke test.
