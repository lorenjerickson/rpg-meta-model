import type { EntryDetail, EntrySummary } from '@dnd-domain/utils';

/** Where the API is, from the server's point of view (in Docker, the api service). */
export function apiUrl(): string {
  return (process.env.API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
}

export class ApiUnavailableError extends Error {}

async function getJson<T>(path: string): Promise<T | undefined> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl()}${path}`, { cache: 'no-store' });
  } catch (error) {
    throw new ApiUnavailableError(`The API at ${apiUrl()} is not reachable`, { cause: error });
  }
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`GET ${path} failed: ${String(response.status)}`);
  return (await response.json()) as T;
}

export function getEntries(catalog: string) {
  return getJson<EntrySummary[]>(`/catalogs/${encodeURIComponent(catalog)}`);
}

export function getEntry(catalog: string, id: string) {
  return getJson<EntryDetail>(`/catalogs/${encodeURIComponent(catalog)}/${encodeURIComponent(id)}`);
}

/** A blank entry of one kind of a catalog, to fill in and create. */
export function getDraft(catalog: string, part: number) {
  return getJson<EntryDetail>(`/catalogs/${encodeURIComponent(catalog)}/new?part=${String(part)}`);
}

/**
 * Forwards a browser request to the API, so the browser only ever talks to this app. Used for
 * the catalog API under /api and for images under /content.
 */
export async function forward(request: Request, path: string): Promise<Response> {
  const target = new URL(`${apiUrl()}${path}`);
  target.search = new URL(request.url).search;
  const headers = new Headers();
  for (const name of ['content-type', 'accept']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      ...(hasBody ? { body: request.body, duplex: 'half' } : {}),
      cache: 'no-store',
    });
    // fetch has already decoded the body, so its length and encoding headers no longer apply.
    const passed = new Headers(response.headers);
    for (const name of ['content-encoding', 'content-length', 'transfer-encoding', 'connection']) {
      passed.delete(name);
    }
    return new Response(response.body, { status: response.status, headers: passed });
  } catch {
    return Response.json({ message: 'The API is not reachable' }, { status: 502 });
  }
}
