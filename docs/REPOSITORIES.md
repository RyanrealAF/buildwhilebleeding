# Build While Bleeding — Sub-Repository Ecosystem Modifications & Link Repair Guide

This guide provides a comprehensive specification for modifying each sub-repository in the **Build While Bleeding** network (`RyanrealAF/buildwhilebleeding`).

---

## 1. Universal Architectural & Link Resolution Principles

When sub-applications are proxied under `buildwhilebleeding.com` (e.g., `buildwhilebleeding.com/hardwire/` → `the-hardwire-method.pages.dev`), browser link and asset resolution behave differently than on a root domain.

To guarantee that assets, deep links, and service workers work seamlessly across both custom subpath proxies and standalone `.pages.dev` URLs, follow these rules across all sub-repos:

### A. Document-Relative Asset Resolution (`base: './'`)
- **Vite Apps**: In `vite.config.ts`, specify `base: './'` (or `base: ''`). Do **NOT** use root-relative `base: '/'` or `base: '/hardwire/'`.
- **Static HTML**: All `<link rel="stylesheet">`, `<script src="...">`, and `<img>` tags must omit leading slashes (`styles.css` or `./styles.css`, **never** `/styles.css`).

### B. Trailing Slash Enforcement
- Relative paths like `./assets/main.js` resolve against the parent directory of the current URL.
- `buildwhilebleeding.com/hardwire/` resolves `./assets/main.js` to `/hardwire/assets/main.js` (Correct).
- `buildwhilebleeding.com/hardwire` resolves `./assets/main.js` to `/assets/main.js` (Incorrect).
- **Rule**: BWB's `public/_worker.js` enforces a `308` redirect adding a trailing slash to directory requests. Ensure all client navigation links include trailing slashes (e.g., `<a href="/hardwire/">`).

### C. Service Worker Scope Isolation
- Service workers registered with scope `/` will attempt to control the master umbrella site (`buildwhilebleeding.com`).
- **Rule**: When registering service workers in sub-projects, always limit scope:
  ```js
  navigator.serviceWorker.register('./sw.js', { scope: './' });
  ```
- BWB's umbrella worker also includes a global `sw.js` interceptor that serves a clean no-op service worker to unregister conflicting top-level service workers.

---

## 2. Repository-Specific Modifications & Redesign Blueprints

---

### Repo 1: `Hardwire`
- **GitHub Repository**: [`RyanrealAF/Hardwire`](https://github.com/RyanrealAF/Hardwire)
- **Production Host**: `https://the-hardwire-method.pages.dev`
- **Umbrella Subpath**: `/hardwire/`
- **Tech Stack**: Vite, React, Tailwind CSS, PWA

#### Specific Modifications Required
1. **`vite.config.ts`**:
   ```typescript
   export default defineConfig({
     base: './', // Ensures assets are loaded relatively
     plugins: [react()],
   });
   ```
2. **`index.html` PWA Registration**:
   Update service worker registration:
   ```javascript
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('./sw.js', { scope: './' });
   }
   ```
3. **Header Return Link**:
   In the main layout header, add a persistent navigation item pointing back to the master umbrella:
   ```tsx
   <a href="https://buildwhilebleeding.com" className="umbrella-back-link">
     ← Build While Bleeding
   </a>
   ```

---

### Repo 2: `Seuss` (Complete Redesign & Cloudflare Pages Setup)
- **GitHub Repository**: [`RyanrealAF/Seuss`](https://github.com/RyanrealAF/Seuss)
- **Target Host**: Cloudflare Pages (`https://the-seuss-library.pages.dev`)
- **Umbrella Subpath**: `/library/seuss/`
- **Tech Stack**: Static HTML, CSS, JavaScript, PDF Documents

#### Step-by-Step Setup & Modifications
1. **Cloudflare Pages Deployment**:
   - In Cloudflare Dashboard, create a new Pages project connected to `RyanrealAF/Seuss`.
   - Build command: *None* (or leave empty).
   - Build output directory: `/` (root).
   - Project Name: `the-seuss-library` (produces `https://the-seuss-library.pages.dev`).

2. **Fix Asset & PDF Links in `index.html`**:
   Replace any absolute paths with relative paths:
   - Change `/styles.css` → `./styles.css`
   - Change `/Book%201-...pdf` → `./Book%201-...pdf`

3. **Complete UI Redesign Blueprint**:
   Transform `index.html` from a basic list into a modern, responsive digital library UI matching the Build While Bleeding aesthetic:
   - **Dark Mode Aesthetic**: Monospaced typography headers, minimalist borders (`#1e293b`), subtle grid backgrounds, and high-contrast text.
   - **Interactive Filter Tabs**: Add JavaScript filtering for categories:
     - `All Volumes`
     - `Meter & Cadence`
     - `Rhythm Schemes`
     - `Syllable Transfer`
   - **Embedded PDF Viewer Modal**: Allow visitors to preview or read PDF manuscripts directly in an in-page modal iframe or download directly.
   - **Header Navigation**: Add top bar with `Build While Bleeding / Library / Seuss` breadcrumbs.

---

### Repo 3: `The Leak Report`
- **GitHub Repository**: [`RyanrealAF/Theleakreport`](https://github.com/RyanrealAF/Theleakreport)
- **Production Host**: `https://the-leak-report.pages.dev`
- **Umbrella Subpath**: `/the-leak-report/`
- **Tech Stack**: Vite, React, Tailwind CSS

#### Specific Modifications Required
1. **`vite.config.ts`**:
   Ensure `base: './'` is configured so JavaScript and CSS bundles load via relative paths `./assets/index.js`.
2. **SPA Client-Side Deep Links (`public/_redirects`)**:
   Create a file at `public/_redirects` containing:
   ```text
   /*  /index.html  200
   ```
   This allows direct navigation to client routes (e.g., `buildwhilebleeding.com/the-leak-report/analysis/1`) without returning 404 from Cloudflare Pages.
3. **Decouple Backend / Express Server**:
   If `Theleakreport` contains Node/Express API routes, deploy the API to Cloudflare Workers or Railway/Render, and set the client's API base URL via environment variable (`VITE_API_BASE_URL`).

---

### Repo 4: `Cartography`
- **GitHub Repository**: [`RyanrealAF/Cartography`](https://github.com/RyanrealAF/Cartography)
- **Production Host**: `https://cartography.pages.dev`
- **Umbrella Subpath**: `/cartography/`
- **Tech Stack**: Vanilla HTML5, CSS3, JavaScript (`app.js`)

#### Specific Modifications Required
1. **`index.html` Relative Links**:
   Ensure all stylesheets, scripts, and asset links are relative:
   ```html
   <link rel="stylesheet" href="./styles.css">
   <script src="./app.js" defer></script>
   ```
2. **`app.js` Data Fetching**:
   If `app.js` loads JSON or image assets dynamically via `fetch('/data/map.json')`, update them to document-relative calls:
   ```js
   fetch('./data/map.json')
   ```
3. **Download Links**:
   Ensure PDF and document links (e.g. `The RyanrealAF Codex`) use relative URL encoding:
   ```html
   <a href="./The%20RyanrealAF%20Codex.pdf" download>Download Codex</a>
   ```

---

### Repo 5: `The Mosaic Theory`
- **GitHub Repository**: [`RyanrealAF/The_Mosaic_Theory`](https://github.com/RyanrealAF/The_Mosaic_Theory)
- **Production Host**: `https://the-mosaic-theory.pages.dev`
- **Umbrella Subpath**: `/mosaic/`
- **Tech Stack**: Vite, React, React Router

#### Specific Modifications Required
1. **`vite.config.ts`**:
   Confirm `base: './'` is set.
2. **React Router Basename**:
   In `App.tsx` or router setup, use dynamic or relative basename handling so client-side navigation works under both `the-mosaic-theory.pages.dev` and `buildwhilebleeding.com/mosaic/`:
   ```tsx
   <BrowserRouter basename={window.location.pathname.startsWith('/mosaic') ? '/mosaic' : '/'}>
   ```
3. **Asset & Image Paths**:
   Ensure images inside components reference imported assets (`import img from './assets/img.png'`) or relative paths (`./assets/...`).

---

## 3. Summary Check List for Repository Owners

| Repository | `base: './'` in Vite | Relative HTML/CSS Assets | Service Worker Scope | SPA `_redirects` | Umbrella Return Header |
|---|---|---|---|---|---|
| **Hardwire** | Required | Required | `{ scope: './' }` | Optional | Recommended |
| **Seuss** | N/A (Static) | Required (`./`) | N/A | N/A | Recommended |
| **The Leak Report** | Required | Required | N/A | Required (`/* /index.html 200`)| Recommended |
| **Cartography** | N/A (Static) | Required (`./`) | N/A | N/A | Recommended |
| **The Mosaic Theory** | Required | Required | N/A | Optional | Recommended |
