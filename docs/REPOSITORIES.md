# Build While Bleeding — Multi-Repository Ecosystem Architecture & Fixes

This document details the configuration, routing mechanisms, discovered link issues, and suggested changes for each repository in the **Build While Bleeding** network.

---

## 1. `BuildWhileBleeding` (Master Umbrella)
- **Repository**: [`RyanrealAF/buildwhilebleeding`](https://github.com/RyanrealAF/buildwhilebleeding)
- **Production Host**: `https://buildwhilebleeding.com`
- **Deployment Platform**: Cloudflare Pages (Advanced Mode using `public/_worker.js`)
- **Role**: Front door, archive ledger, and reverse-proxy gateway for all sub-territories.

### Issues Identified
1. `public/_worker.js` only had mappings for `/hardwire`, `/mosaic`, and `/mosaic-theory`.
   - `/the-leak-report` and `/cartography` were missing from the proxy dictionary, causing Cloudflare to fall back to the root SPA `index.html`.
2. Any service worker registration attempts on subpaths (e.g. `/the-leak-report/sw.js`) could intercept parent scope requests unless given a dummy no-op service worker.

### Suggested Changes & Implementation
- **Worker Script (`public/_worker.js`)**:
  - Expanded `PROJECTS` dictionary to include `/the-leak-report`, `/theleakreport`, `/cartography`, and `/library/seuss`.
  - Generalized the `NOOP_SW` interceptor for any subpath requesting `/sw.js`.
- **UI (`src/App.tsx`)**:
  - Keep direct links to each `.pages.dev` deployment for resilience and direct exploration, while displaying their canonical `/route` paths for umbrella routing.

---

## 2. `Hardwire`
- **Repository**: [`RyanrealAF/Hardwire`](https://github.com/RyanrealAF/Hardwire)
- **Production Host**: `https://the-hardwire-method.pages.dev`
- **Subpath Route**: `/hardwire` on `buildwhilebleeding.com`
- **Tech Stack**: Vite + React + Tailwind CSS + PWA

### Issues Identified
1. **PWA Service Worker Registration Scope**: In `index.html`, `navigator.serviceWorker.register('./sw.js')` attempts to register at the root scope `/hardwire/sw.js`.
2. **Canonical Asset Paths**: In Vite, `base: './'` is used, which makes relative asset resolution (`./assets/...`) work well with path prefix proxying.

### Suggested Changes
- **Vite Config (`vite.config.ts`)**: Keep `base: './'` so that all CSS/JS chunks load relative to `/hardwire/`.
- **PWA Service Worker**: Ensure service worker registration specifies `{ scope: './' }` or allows fallback when proxied under BWB's domain.

---

## 3. `Theleakreport`
- **Repository**: [`RyanrealAF/Theleakreport`](https://github.com/RyanrealAF/Theleakreport)
- **Production Host**: `https://the-leak-report.pages.dev` (also reachable via `https://theleakreport.pages.dev`)
- **Subpath Route**: `/the-leak-report` on `buildwhilebleeding.com`
- **Tech Stack**: Vite + React + Tailwind CSS

### Issues Identified
1. **Missing from Umbrella Worker**: Prior to this fix, accessing `https://buildwhilebleeding.com/the-leak-report` served the main BWB landing page rather than proxying to `the-leak-report.pages.dev`.
2. **Asset Path Resolution**: `the-leak-report.pages.dev` index links to `./assets/index-DhwR-TAl.js` and `./assets/index-Cj1Zc67q.css`. When proxied under `/the-leak-report`, trailing slashes are mandatory (`/the-leak-report/`) to ensure the browser resolves `./assets/` to `/the-leak-report/assets/`.

### Suggested Changes
- In `Theleakreport`'s `vite.config.ts`, verify that `base` is set to `'./'` (relative) so assets load correctly on both the standalone domain and under the `/the-leak-report/` proxy prefix.

---

## 4. `Cartography`
- **Repository**: [`RyanrealAF/Cartography`](https://github.com/RyanrealAF/Cartography)
- **Production Host**: `https://cartography.pages.dev`
- **Subpath Route**: `/cartography` on `buildwhilebleeding.com`
- **Tech Stack**: Vanilla HTML5 + CSS + JavaScript (`app.js`, `styles.css`)

### Issues Identified
1. **Missing from Umbrella Worker**: Requests to `https://buildwhilebleeding.com/cartography` returned BWB root index instead of the Cartography map.
2. **Root Relative vs Document Relative Links**: Links in `index.html` point to `styles.css`, `app.js`, and PDF downloads like `The%20RyanrealAF%20Codex_...pdf`. Because they are document-relative, proxying under `/cartography/` works cleanly as long as the trailing slash is enforced.

### Suggested Changes
- In `Cartography/index.html`: Ensure internal navigation anchors and links remain relative (no leading `/`) so they resolve smoothly both on `cartography.pages.dev` and on `buildwhilebleeding.com/cartography/`.

---

## 5. `The_Mosaic_Theory`
- **Repository**: [`RyanrealAF/The_Mosaic_Theory`](https://github.com/RyanrealAF/The_Mosaic_Theory)
- **Production Host**: `https://the-mosaic-theory.pages.dev`
- **Subpath Route**: `/mosaic` on `buildwhilebleeding.com`
- **Tech Stack**: Vite + React + Express / Node (`server.ts`)

### Status & Verification
- `public/_worker.js` correctly maps both `/mosaic` and `/mosaic-theory` to `https://the-mosaic-theory.pages.dev`.
- Both standalone URL and reverse-proxied URL `https://buildwhilebleeding.com/mosaic/` resolve with HTTP 200.

---

## 6. `Seuss`
- **Repository**: [`RyanrealAF/Seuss`](https://github.com/RyanrealAF/Seuss)
- **Production Host**: Currently served via raw CDN (`https://raw.githack.com/RyanrealAF/Seuss/main/index.html`)
- **Subpath Route**: `/library/seuss`
- **Tech Stack**: Static HTML, CSS, JavaScript, PDF library books

### Issues Identified
1. **No Standalone Cloudflare Pages Project**: Unlike the other 4 repositories, `Seuss` is not yet connected to a dedicated Cloudflare Pages domain (e.g. `seuss.pages.dev` or `the-seuss-method.pages.dev`).
2. **PDF and Asset Delivery**: PDF downloads in `index.html` use relative paths (`Book%201-...pdf`). When served via `raw.githack.com`, downloading large PDFs may experience throttling or cross-origin restrictions.

### Suggested Changes
1. **Create Cloudflare Pages Deployment**:
   - In Cloudflare Dashboard, create a new Pages project connected to `RyanrealAF/Seuss`.
   - Build command: None (or leave blank for static assets).
   - Build output directory: `/` (root).
   - Expected domain: e.g. `https://the-seuss-library.pages.dev` (or whatever Pages name is available).
2. **Update BWB Worker & UI**:
   - Point `PROJECTS["/library/seuss"]` to the new Pages domain.
