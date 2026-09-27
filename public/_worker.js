/**
 * BuildWhileBleeding — Master Umbrella _worker.js
 * Cloudflare Pages Advanced Mode (public/_worker.js)
 *
 * Acts as the front-door reverse proxy for all sub-territories.
 * Routes subpaths to their respective .pages.dev deployments,
 * enforces trailing-slash redirects for relative-asset safety,
 * and intercepts cross-project service worker registrations.
 */

// ── Project routing table ──────────────────────────────────────────────
const PROJECTS = {
  "/hardwire":        "https://the-hardwire-method.pages.dev",
  "/the-leak-report": "https://the-leak-report.pages.dev",
  "/theleakreport":   "https://the-leak-report.pages.dev",
  "/cartography":     "https://cartography.pages.dev",
  "/mosaic":          "https://the-mosaic-theory.pages.dev",
  "/library/seuss":   "https://raw.githack.com/RyanrealAF/Seuss/main/index.html",
};

// ── Paths that require a trailing slash for relative asset resolution ───
const TRAILING_SLASH_REQUIRED = [
  "/hardwire",
  "/the-leak-report",
  "/theleakreport",
  "/mosaic",
  "/library/seuss",
  "/cartography",
];

// ── Helper: find the matching project prefix for a pathname ─────────────
function findProject(pathname) {
  const sortedKeys = Object.keys(PROJECTS).sort((a, b) => b.length - a.length);
  for (const prefix of sortedKeys) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return prefix;
    }
  }
  return null;
}

// ── Helper: check if pathname needs trailing slash redirect ────────────
function needsTrailingSlash(pathname) {
  for (const prefix of TRAILING_SLASH_REQUIRED) {
    if (pathname === prefix) return prefix + "/";
    if (pathname.startsWith(prefix + "/")) {
      const subPath = pathname.slice(prefix.length + 1);
      const lastSegment = subPath.split("/").pop();
      if (lastSegment && !lastSegment.includes(".") && !pathname.endsWith("/")) {
        return pathname + "/";
      }
    }
  }
  return null;
}

// ── Main fetch handler ─────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ── 1. Service Worker no-op interceptor ─────────────────────────────
    if (pathname.endsWith("/sw.js")) {
      return new Response(
        `/* no-op service worker */
        self.addEventListener("install", (e) => self.skipWaiting());
        self.addEventListener("activate", (e) => {
          self.registration.unregister();
          e.waitUntil(clients.claim());
        });`,
        {
          status: 200,
          headers: { "Content-Type": "application/javascript; charset=utf-8",
                     "Cache-Control": "no-store, no-cache, must-revalidate",
                     "Service-Worker-Allowed": "/" },
        }
      );
    }

    // ── 2. Trailing-slash enforcement (308 permanent redirect) ─────────
    const slashRedirect = needsTrailingSlash(pathname);
    if (slashRedirect) {
      const redirectUrl = new URL(slashRedirect, url.origin);
      redirectUrl.search = url.search;
      return Response.redirect(redirectUrl.toString(), 308);
    }

    // ── 3. Project reverse-proxy routing ───────────────────────────────
    const projectPrefix = findProject(pathname);
    if (projectPrefix) {
      const upstream = PROJECTS[projectPrefix];
      const subPath = pathname.slice(projectPrefix.length) || "/";
      const proxyUrl = new URL(subPath, upstream);
      proxyUrl.search = url.search;

      const proxyRequest = new Request(proxyUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      });

      const response = await fetch(proxyRequest);

      const newHeaders = new Headers(response.headers);
      const location = newHeaders.get("Location");
      if (location) {
        try {
          const locUrl = new URL(location, upstream);
          if (locUrl.origin === new URL(upstream).origin) {
            newHeaders.set("Location", projectPrefix + locUrl.pathname + locUrl.search + locUrl.hash);
          }
        } catch (_) {}
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // ── 4. Fallback: serve static assets from the Pages project itself ──
    return env.ASSETS.fetch(request);
  },
};
