interface PhotoMap {
  [itemId: string]: string[] | string;
}

export async function DELETE(
  _request: Request,
  env: { DB: D1Database; BUCKET: R2Bucket },
  params: { id: string }
): Promise<Response> {
  const row = await env.DB.prepare('SELECT photos FROM responses WHERE id = ?')
    .bind(params.id)
    .first<{ photos?: string }>();

  if (!row) {
    return Response.json({ error: 'Registro não encontrado.' }, { status: 404 });
  }

  if (env.BUCKET && row.photos) {
    let keys: string[] = [];
    try {
      const parsed = JSON.parse(row.photos) as PhotoMap;
      keys = Object.values(parsed).flatMap((entry) =>
        Array.isArray(entry) ? entry : entry ? [entry] : []
      );
    } catch {
      keys = [];
    }
    await Promise.all(
      keys.map((key) => env.BUCKET.delete(key).catch(() => undefined))
    );
  }

  await env.DB.prepare('DELETE FROM responses WHERE id = ?').bind(params.id).run();

  return Response.json({ deleted: true });
}
