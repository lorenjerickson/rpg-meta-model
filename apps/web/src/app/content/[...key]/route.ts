import { forward } from '../../../catalogApi';

/** Images and other files from the content repository, reached through this app. */
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  return forward(request, `/content/${key.map(encodeURIComponent).join('/')}`);
}
