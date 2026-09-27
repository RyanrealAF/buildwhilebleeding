# Routing Plan & Umbrella Architecture

Build While Bleeding acts as the umbrella front door. Sub-territory projects remain independently developed, versioned, and deployed.

## Upstream Target Mapping

| Public path | Project | Upstream Destination | Owner Repository | Deployment Type |
|---|---|---|---|---|
| `/` | BuildWhileBleeding | `buildwhilebleeding.pages.dev` | `RyanrealAF/buildwhilebleeding` | Cloudflare Pages (App Root) |
| `/hardwire/*` | Hardwire | `https://the-hardwire-method.pages.dev` | `RyanrealAF/Hardwire` | Vite + React PWA |
| `/the-leak-report/*` | The Leak Report | `https://the-leak-report.pages.dev` | `RyanrealAF/Theleakreport` | Vite + React SPA |
| `/theleakreport/*` | The Leak Report (alias) | `https://the-leak-report.pages.dev` | `RyanrealAF/Theleakreport` | Vite + React SPA |
| `/cartography/*` | Cartography | `https://cartography.pages.dev` | `RyanrealAF/Cartography` | Static HTML / JS Archive |
| `/mosaic/*` | The Mosaic Theory | `https://the-mosaic-theory.pages.dev` | `RyanrealAF/The_Mosaic_Theory` | Vite + React SPA |
| `/mosaic-theory/*` | The Mosaic Theory (alias) | `https://the-mosaic-theory.pages.dev` | `RyanrealAF/The_Mosaic_Theory` | Vite + React SPA |
| `/library/seuss/*` | Seuss | `https://the-seuss-library.pages.dev` | `RyanrealAF/Seuss` | Static HTML / PDF Library |

---

## Technical Reverse Proxy Mechanism (`public/_worker.js`)

Build While Bleeding uses **Cloudflare Pages Advanced Mode** via `public/_worker.js` (copied to `dist/_worker.js` during Vite build).

### Core Worker Responsibilities
1. **Reverse Proxying**: Intercepts requests for mapped prefixes (`/hardwire`, `/the-leak-report`, `/cartography`, `/mosaic`, `/library/seuss`) and fetches upstream response content from `.pages.dev` origins while keeping the user's browser URL unchanged at `buildwhilebleeding.com`.
2. **Trailing Slash Enforcement (`308 Permanent Redirect`)**: Automatically redirects requests without trailing slashes (e.g. `/hardwire`) to `/hardwire/` to ensure browsers calculate relative asset requests (`./assets/...`) correctly.
3. **Service Worker Interceptor**: Intercepts subpath calls to `/sw.js` and serves a no-op service worker to prevent scoped service workers from conflicting across territories or controlling the umbrella root scope.
4. **Header Location Rewriting**: Rewrites upstream redirect `Location` headers so that relative redirects from project origins stay under `buildwhilebleeding.com`.

---

## Rules for Sub-Repository Owners

1. **Always use relative asset base** (`base: './'` in Vite or relative URLs `./styles.css` in HTML).
2. **Never hardcode root-relative paths** (`/assets/...` or `/styles.css`).
3. **Limit Service Worker scopes** to `./` rather than `/`.
4. **Include umbrella return links** back to `https://buildwhilebleeding.com/` in sub-app headers.
