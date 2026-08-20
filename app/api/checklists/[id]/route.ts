import type { Template } from '../../../../domain/checklist';

export async function PUT(
  request: Request,
  env: { DB: D1Database },
  params: { id: string }
): Promise<Response> {
  const body = await request.json();

  if (!body.title || !body.items || body.items.length === 0) {
    return Response.json({ error: 'Nome e perguntas são obrigatórios.' }, { status: 400 });
  }

  const now = Date.now();

  await env.DB.prepare(
    'UPDATE checklists SET title = ?, description = ?, category = ?, items = ?, updated_at = ? WHERE id = ?'
  )
    .bind(
      body.title,
      body.description || '',
      body.category || 'Geral',
      JSON.stringify(body.items),
      now,
      params.id
    )
    .run();

  return Response.json({ saved: true });
}
