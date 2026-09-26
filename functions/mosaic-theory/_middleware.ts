const ORIGIN = "https://the-mosaic-theory.pages.dev";

export async function onRequest(context: any) {
  const incoming = new URL(context.request.url);

  if (incoming.pathname === "/mosaic-theory") {
    return Response.redirect(new URL("/mosaic-theory/", incoming), 308);
  }

  const upstreamPath = incoming.pathname.replace(/^\/mosaic-theory/, "") || "/";
  const upstream = new URL(upstreamPath, ORIGIN);
  upstream.search = incoming.search;

  const request = new Request(upstream.toString(), context.request);
  const response = await fetch(request);

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  const contentType = headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    let html = await response.text();

    html = html
      .replace(/(src|href)="\/assets\//g, '$1="/mosaic-theory/assets/')
      .replaceAll('src="/src/main.tsx"', 'src="/mosaic-theory/src/main.tsx"')
      .replaceAll('href="/manifest.json"', 'href="/mosaic-theory/manifest.json"')
      .replaceAll('href="/icon-192.png"', 'href="/mosaic-theory/icon-192.png"')
      .replaceAll('href="/icons/icon.svg"', 'href="/mosaic-theory/icons/icon.svg"')
      .replaceAll('src="/sw.js"', 'src="/mosaic-theory/sw.js"');

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
