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
    'UPDATE checklists SET title = ?, description = ?, category = ?, items = ?, header_id = ?, updated_at = ? WHERE id = ?'
  )
    .bind(
      body.title,
      body.description || '',
      body.category || 'Geral',
      JSON.stringify(body.items),
      typeof body.headerId === 'string' && body.headerId ? body.headerId : null,
      now,
      params.id
    )
    .run();

  return Response.json({ saved: true });
}

export async function DELETE(
  _request: Request,
  env: { DB: D1Database },
  params: { id: string }
): Promise<Response> {
  await env.DB.prepare('DELETE FROM checklists WHERE id = ?')
    .bind(params.id)
    .run();

  return Response.json({ deleted: true });
}
