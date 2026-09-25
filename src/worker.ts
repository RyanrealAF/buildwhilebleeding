interface Env {
  ASSETS: Fetcher;
  HARDWIRE_ORIGIN: string;
  SEUSS_ORIGIN: string;
  LEAK_REPORT_ORIGIN: string;
  CARTOGRAPHY_ORIGIN: string;
}

const mounts: Array<[string, keyof Env]> = [
  ['/hardwire', 'HARDWIRE_ORIGIN'],
  ['/library/seuss', 'SEUSS_ORIGIN'],
  ['/the-leak-report', 'LEAK_REPORT_ORIGIN'],
  ['/cartography', 'CARTOGRAPHY_ORIGIN'],
];

function matchMount(pathname: string) {
  return mounts.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'));
}

function proxyRequest(request: Request, prefix: string, origin: string): Promise<Response> {
  if (!origin || origin === '__SET_ME__') {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          error: 'Route target not configured',
          mount: prefix,
        }),
        {
          status: 503,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        },
      ),
    );
  }

  const incoming = new URL(request.url);
  const suffix = incoming.pathname.slice(prefix.length) || '/';
  const target = new URL(origin);
  target.pathname = suffix.startsWith('/') ? suffix : '/' + suffix;
  target.search = incoming.search;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  return fetch(new Request(target.toString(), init));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const mount = matchMount(url.pathname);

    if (mount) {
      const [prefix, originKey] = mount;

      if (url.pathname === prefix) {
        return Response.redirect(new URL(prefix + '/', url).toString(), 308);
      }

      return proxyRequest(request, prefix, env[originKey] as string);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
