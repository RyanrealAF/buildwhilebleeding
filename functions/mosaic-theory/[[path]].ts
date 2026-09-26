const ORIGIN = "https://the-mosaic-theory.pages.dev";

function rewriteHtml(html: string) {
  return html
    .replace(/(src|href)="\/(?!mosaic-theory\/)([^"]+)"/g, '$1="/mosaic-theory/$2"')
    .replace(/url\(\/(?!mosaic-theory\/)/g, "url(/mosaic-theory/");
}

export async function onRequest(context: any) {
  const incoming = new URL(context.request.url);
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
    const html = rewriteHtml(await response.text());
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
