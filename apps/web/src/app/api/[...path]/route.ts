import { forward } from '../../../catalogApi';

interface Context {
  params: Promise<{ path: string[] }>;
}

/** The catalog API, reached through this app. */
async function handle(request: Request, { params }: Context) {
  const { path } = await params;
  if (path[0] !== 'catalogs') return Response.json({ message: 'Not found' }, { status: 404 });
  return forward(request, `/${path.map(encodeURIComponent).join('/')}`);
}

export { handle as DELETE, handle as GET, handle as POST, handle as PUT };
