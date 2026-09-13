import { templateSchema } from '@/domain/schema';

export async function PUT(
  request: Request,
  env: { DB: D1Database },
  params: { id: string }
): Promise<Response> {
  const body = await request.json();
  const parsed = templateSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues.map((i) => i.message).join('. ') },
      { status: 400 },
    );
  }

  const template = parsed.data;
  const now = Date.now();

  await env.DB.prepare(
    'UPDATE checklists SET title = ?, description = ?, category = ?, items = ?, header_id = ?, updated_at = ? WHERE id = ?'
  )
    .bind(
      template.title,
      template.description,
      template.category,
      JSON.stringify(template.items),
      template.headerId || null,
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
