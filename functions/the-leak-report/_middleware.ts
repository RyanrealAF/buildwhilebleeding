const ORIGIN = "https://the-leak-report.pages.dev";

export async function onRequest(context: any) {
  const incoming = new URL(context.request.url);

  if (incoming.pathname === "/the-leak-report") {
    return Response.redirect(new URL("/the-leak-report/", incoming), 308);
  }

  const upstreamPath = incoming.pathname.replace(/^\/the-leak-report/, "") || "/";
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
      .replace(/(src|href)="\/assets\//g, '$1="/the-leak-report/assets/')
      .replaceAll('href="/manifest.json"', 'href="/the-leak-report/manifest.json"')
      .replaceAll('href="/icon-192.png"', 'href="/the-leak-report/icon-192.png"')
      .replaceAll('href="/icons/icon.svg"', 'href="/the-leak-report/icons/icon.svg"')
      .replaceAll('src="/sw.js"', 'src="/the-leak-report/sw.js"');

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
