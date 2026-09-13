import { responsePayloadSchema } from '@/domain/schema';

interface PhotoMap {
  [itemId: string]: string[] | string;
}

function listKeys(photosJson?: string): string[] {
  if (!photosJson) return [];
  try {
    const parsed = JSON.parse(photosJson) as PhotoMap;
    return Object.values(parsed).flatMap((entry) =>
      Array.isArray(entry) ? entry : entry ? [entry] : []
    );
  } catch {
    return [];
  }
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function PUT(
  request: Request,
  env: { DB: D1Database; BUCKET: R2Bucket },
  params: { id: string }
): Promise<Response> {
  const row = await env.DB.prepare('SELECT photos FROM responses WHERE id = ?')
    .bind(params.id)
    .first<{ photos?: string }>();

  if (!row) {
    return Response.json({ error: 'Registro não encontrado.' }, { status: 404 });
  }

  const formData = await request.formData();

  const parsed = responsePayloadSchema.safeParse({
    answers: parseJson(formData.get('answers'), {}),
    metadata: parseJson(formData.get('metadata'), {}),
    itemObservations: parseJson(formData.get('item_observations'), {}),
    extraItems: parseJson(formData.get('extra_items'), []),
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues.map((i) => i.message).join('. ') },
      { status: 400 },
    );
  }

  const { answers, metadata, itemObservations, extraItems } = parsed.data;
  const signerName = formData.get('signerName');

  const kept: Record<string, string[]> = parseJson(formData.get('photos'), {});
  const keptSet = new Set(Object.values(kept).flat());
  const removedKeys = listKeys(row.photos).filter((key) => !keptSet.has(key));

  await Promise.all(removedKeys.map((key) => env.BUCKET.delete(key).catch(() => undefined)));

  const photos: Record<string, string[]> = kept;

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('photo:') && value instanceof File) {
      const itemId = key.slice('photo:'.length);
      const filename = value.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const r2Key = `responses/${params.id}/${itemId}-${crypto.randomUUID().slice(0, 8)}-${filename}`;

      await env.BUCKET.put(r2Key, value, {
        httpMetadata: { contentType: value.type },
      });

      photos[itemId] = [...(photos[itemId] || []), r2Key];
    }
  }

  await env.DB.prepare(
    'UPDATE responses SET answers = ?, metadata = ?, item_observations = ?, photos = ?, signature_name = ?, extra_items = ?, updated_at = ? WHERE id = ?'
  )
    .bind(
      JSON.stringify(answers),
      JSON.stringify(metadata),
      JSON.stringify(itemObservations),
      JSON.stringify(photos),
      typeof signerName === 'string' ? signerName : '',
      JSON.stringify(extraItems),
      Date.now(),
      params.id
    )
    .run();

  return Response.json({ saved: true });
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
    await Promise.all(
      listKeys(row.photos).map((key) => env.BUCKET.delete(key).catch(() => undefined))
    );
  }

  await env.DB.prepare('DELETE FROM responses WHERE id = ?').bind(params.id).run();

  return Response.json({ deleted: true });
}
