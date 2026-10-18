import { readFile } from 'node:fs/promises';
import { resolveMedia } from '@/lib/admin/docs';

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export async function GET(
  _req: Request,
  { params }: RouteContext<'/api/media/[...path]'>
) {
  const { path: segments } = await params;
  const name = segments.join('/');
  try {
    const content = await readFile(resolveMedia(name));
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    return new Response(new Uint8Array(content), {
      headers: {
        'Content-Type': TYPES[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}
