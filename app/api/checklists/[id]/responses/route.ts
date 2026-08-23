export async function POST(
  request: Request,
  env: { DB: D1Database; BUCKET: R2Bucket },
  params: { id: string }
): Promise<Response> {
  const formData = await request.formData();
  const answersJson = formData.get('answers');

  if (!answersJson || typeof answersJson !== 'string') {
    return Response.json({ error: 'Respostas são obrigatórias.' }, { status: 400 });
  }

  const metadata = formData.get('metadata');
  const observations = formData.get('observations');
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
    'INSERT INTO responses (id, checklist_id, answers, metadata, observations, photos, signature_name, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(
      responseId,
      params.id,
      answersJson,
      typeof metadata === 'string' ? metadata : '{}',
      typeof observations === 'string' ? observations : '',
      JSON.stringify(photos),
      typeof signerName === 'string' ? signerName : '',
      Date.now()
    )
    .run();

  return Response.json({ id: responseId, saved: true }, { status: 201 });
}
