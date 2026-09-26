const ORIGIN = "https://the-hardwire-method.pages.dev";

function rewriteHtml(html: string) {
  return html
    .replace(/(src|href)="\/(?!hardwire\/)([^"]+)"/g, '$1="/hardwire/$2"')
    .replace(/url\(\/(?!hardwire\/)/g, "url(/hardwire/");
}

export async function onRequest(context: any) {
  const incoming = new URL(context.request.url);
  const upstreamPath = incoming.pathname.replace(/^\/hardwire/, "") || "/";
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
