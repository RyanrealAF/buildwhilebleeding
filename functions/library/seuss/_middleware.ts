const ORIGIN = "https://seuss-4aq.pages.dev";

export async function onRequest(context: any) {
  const incoming = new URL(context.request.url);

  if (incoming.pathname === "/library/seuss") {
    return Response.redirect(new URL("/library/seuss/", incoming), 308);
  }

  const upstreamPath = incoming.pathname.replace(/^\/library\/seuss/, "") || "/";
  const upstream = new URL(upstreamPath, ORIGIN);
  upstream.search = incoming.search;

  const request = new Request(upstream.toString(), context.request);
  const response = await fetch(request);

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
