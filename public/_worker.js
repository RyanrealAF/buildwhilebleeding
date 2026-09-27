/**
 * Pages advanced-mode worker for buildwhilebleeding.com
 *
 * Place this file as public/_worker.js — Vite copies it to dist/_worker.js,
 * and Cloudflare Pages picks it up as the advanced-mode worker.
 *
 * 1. Proxies subpaths (/hardwire, /mosaic-theory, etc.) to the
 *    corresponding Pages projects.
 * 2. Serves static assets for everything else via env.ASSETS.
 * 3. Falls back to index.html for unknown paths so the SPA
 *    router can handle client-side routes.
 */

const PROJECT_MAP = {
  '/hardwire': 'the-hardwire-method.pages.dev',
  '/mosaic-theory': 'the-mosaic-theory.pages.dev',
  '/leak-report': 'the-leak-report.pages.dev',
  '/cartography': 'cartography.pages.dev',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Check if path matches a mapped subpath prefix
    for (const [prefix, target] of Object.entries(PROJECT_MAP)) {
      if (path === prefix || path.startsWith(prefix + '/')) {
        const subPath = path.slice(prefix.length) || '/';
        const targetUrl = `https://${target}${subPath}${url.search}`;
        const proxyRequest = new Request(targetUrl, request);
        return fetch(proxyRequest);
      }
    }

    // Try to serve static asset (CSS, JS, images, index.html, etc.)
    const assetResponse = await env.ASSETS.fetch(request);

    // If asset not found, serve index.html so the SPA router can handle it
    if (assetResponse.status === 404) {
      const indexRequest = new Request(new URL('/index.html', url), request);
      return env.ASSETS.fetch(indexRequest);
    }

    return assetResponse;
  }
};