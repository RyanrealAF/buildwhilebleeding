const PROJECTS = {
  "/hardwire": "https://the-hardwire-method.pages.dev",
  "/the-leak-report": "https://the-leak-report.pages.dev",
  "/theleakreport": "https://the-leak-report.pages.dev",
  "/cartography": "https://cartography.pages.dev",
  "/mosaic": "https://the-mosaic-theory.pages.dev",
  "/mosaic-theory": "https://the-mosaic-theory.pages.dev",
  "/library/seuss": "https://raw.githack.com/RyanrealAF/Seuss/main",
};

function matchProject(pathname) {
  for (const [prefix, origin] of Object.entries(PROJECTS)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return { prefix, origin };
    }
  }
  return null;
}

function rewriteRootPaths(text, prefix) {
  return text
    .replace(/(src|href|action)=(["'])\/(?!\/)([^"']*)\2/gi,
      (_, attr, quote, path) => `${attr}=${quote}${prefix}/${path}${quote}`)
    .replace(/url\(\s*(['"]?)\/(?!\/)/gi,
      (_, quote) => `url(${quote}${prefix}/`);
}

function rewriteManifest(text, prefix) {
  try {
    const manifest = JSON.parse(text);
    const rewrite = value =>
      typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
        ? prefix + value
        : value;

    if (Array.isArray(manifest.icons)) {
      manifest.icons = manifest.icons.map(icon => ({ ...icon, src: rewrite(icon.src) }));
    }
    if (typeof manifest.start_url === "string") manifest.start_url = rewrite(manifest.start_url);
    if (typeof manifest.scope === "string") manifest.scope = rewrite(manifest.scope);
    return JSON.stringify(manifest);
  } catch {
    return text;
  }
}

const NOOP_SW = `self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => event.respondWith(fetch(event.request)));`;

async function proxy(request, prefix, origin) {
  const incoming = new URL(request.url);
  const upstreamPath = incoming.pathname.slice(prefix.length) || "/";
  const upstream = new URL(upstreamPath, origin);
  upstream.search = incoming.search;

  const response = await fetch(new Request(upstream.toString(), request), {
    redirect: "manual",
  });

  const location = response.headers.get("location");
  if (location) {
    const target = new URL(location, upstream);
    const upstreamOrigin = new URL(origin).origin;

    if (target.origin === upstreamOrigin) {
      const localPath = prefix + (target.pathname === "/" ? "/" : target.pathname);
      const local = new URL(localPath, incoming);
      local.search = target.search;
      return new Response(null, {
        status: response.status,
        headers: {
          "location": local.toString(),
          "cache-control": "no-store",
        },
      });
    }

    if (target.hostname === "buildwhilebleeding.com" || target.hostname === "www.buildwhilebleeding.com") {
      const local = new URL(prefix + "/", incoming);
      return new Response(null, {
        status: response.status,
        headers: {
          "location": local.toString(),
          "cache-control": "no-store",
        },
      });
    }
  }

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("content-security-policy");
  headers.delete("location");
  headers.set("x-bwb-proxy", prefix);

  const contentType = headers.get("content-type") || "";

  if (upstreamPath === "/sw.js") {
    headers.set("content-type", "application/javascript; charset=UTF-8");
    headers.set("cache-control", "no-store");
    return new Response(NOOP_SW, {
      status: 200,
      headers,
    });
  }

  if (contentType.includes("text/html")) {
    return new Response(rewriteRootPaths(await response.text(), prefix), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (contentType.includes("manifest+json") || upstreamPath.endsWith("/manifest.json")) {
    return new Response(rewriteManifest(await response.text(), prefix), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (contentType.includes("text/css")) {
    return new Response(
      (await response.text()).replace(
        /url\(\s*(['"]?)\/(?!\/)/g,
        (_, quote) => `url(${quote}${prefix}/`
      ),
      { status: response.status, statusText: response.statusText, headers }
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const project = matchProject(url.pathname);

    if (project) {
      if (url.pathname === project.prefix) {
        return Response.redirect(new URL(project.prefix + "/", url), 308);
      }
      return proxy(request, project.prefix, project.origin);
    }

    return env.ASSETS.fetch(request);
  },
};
