import { responsePayloadSchema } from '@/domain/schema';

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function POST(
  request: Request,
  env: { DB: D1Database; BUCKET: R2Bucket },
  params: { id: string }
): Promise<Response> {
  const formData = await request.formData();

  if (!formData.get('answers')) {
    return Response.json({ error: 'Respostas são obrigatórias.' }, { status: 400 });
  }

  const parsed = responsePayloadSchema.safeParse({
    answers: parseJson(formData.get('answers'), {}),
    metadata: parseJson(formData.get('metadata'), {}),
    observations: formData.get('observations'),
    extraItems: parseJson(formData.get('extra_items'), []),
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues.map((i) => i.message).join('. ') },
      { status: 400 },
    );
  }

  const { answers, metadata, observations, extraItems } = parsed.data;
  const signerName = formData.get('signerName');

  const responseId = crypto.randomUUID();
  const photos: Record<string, string[]> = {};

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('photo:') && value instanceof File) {
      const itemId = key.replace('photo:', '');
      const filename = value.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const r2Key = `responses/${responseId}/${itemId}-${crypto.randomUUID().slice(0, 8)}-${filename}`;

      await env.BUCKET.put(r2Key, value, {
        httpMetadata: { contentType: value.type },
      });

      photos[itemId] = [...(photos[itemId] || []), r2Key];
    }
  }

  await env.DB.prepare(
    'INSERT INTO responses (id, checklist_id, answers, metadata, observations, photos, signature_name, extra_items, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(
      responseId,
      params.id,
      JSON.stringify(answers),
      JSON.stringify(metadata),
      observations,
      JSON.stringify(photos),
      typeof signerName === 'string' ? signerName : '',
      JSON.stringify(extraItems),
      Date.now()
    )
    .run();

  return Response.json({ id: responseId, saved: true }, { status: 201 });
}
