const ORIGIN = "https://the-hardwire-method.pages.dev";

export async function onRequest(context: any) {
  const incoming = new URL(context.request.url);

  if (incoming.pathname === "/hardwire") {
    return Response.redirect(new URL("/hardwire/", incoming), 308);
  }

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
    let html = await response.text();

    // The upstream app was built for root deployment. Rebase root-relative
    // document resources and navigation into /hardwire/.
    html = html
      .replace(/(src|href)="\/(?!hardwire\/)([^"]+)"/g, '$1="/hardwire/$2"')
      .replace(/url\(\/(?!hardwire\/)/g, 'url(/hardwire/')
      .replaceAll("navigator.serviceWorker.register('/hardwire/sw.js')", "navigator.serviceWorker.register('/hardwire/sw.js')");

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
