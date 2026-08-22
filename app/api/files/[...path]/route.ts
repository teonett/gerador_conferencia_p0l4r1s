export async function GET(
  request: Request,
  env: { BUCKET: R2Bucket }
): Promise<Response> {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace('/api/files/', ''));

  if (!key.startsWith('settings/')) {
    return Response.json({ error: 'Recurso não permitido.' }, { status: 403 });
  }

  const object = await env.BUCKET.get(key);
  if (!object) {
    return Response.json({ error: 'Imagem não encontrada.' }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=60');

  return new Response(object.body, { headers });
}
