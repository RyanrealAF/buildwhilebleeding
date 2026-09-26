const PROJECTS = {
  "/hardwire": "https://the-hardwire-method.pages.dev",
  "/mosaic": "https://the-mosaic-theory.pages.dev",
  "/mosaic-theory": "https://the-mosaic-theory.pages.dev",
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
      (_, quote) => `url(${quote}${prefix}/`)
    );
}

function rewriteManifest(text, prefix) {
  try {
    const manifest = JSON.parse(text);
    const rewrite = (value) =>
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

function rewriteServiceWorker(text, prefix) {
  return text.replace(/(["'])\/(?!\/)/g, (_, quote) => quote + prefix + "/");
}

async function proxy(request, prefix, origin) {
  const incoming = new URL(request.url);
  const upstreamPath = incoming.pathname.slice(prefix.length) || "/";
  const upstream = new URL(upstreamPath, origin);
  upstream.search = incoming.search;

  const upstreamRequest = new Request(upstream.toString(), request);
  const response = await fetch(upstreamRequest, { redirect: "manual" });

  const location = response.headers.get("location");
  if (location) {
    const target = new URL(location, upstream);
    const sameOrigin = target.origin === new URL(origin).origin;

    if (sameOrigin) {
      const targetPath = target.pathname === "/" ? "/" : target.pathname;
      const localPath = targetPath === "/"
        ? prefix + "/"
        : prefix + targetPath;

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
  }

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("content-security-policy");
  headers.delete("location");
  headers.set("x-bwb-proxy", prefix);

  const contentType = headers.get("content-type") || "";

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

  if (upstreamPath.endsWith("/sw.js") && contentType.includes("javascript")) {
    return new Response(rewriteServiceWorker(await response.text(), prefix), {
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
