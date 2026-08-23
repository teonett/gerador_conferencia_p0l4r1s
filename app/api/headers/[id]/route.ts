import type { HeaderField } from "../../../../domain/header";

function parseFields(value: unknown): HeaderField[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (f): f is { id: string; label: string } =>
        !!f &&
        typeof f === "object" &&
        typeof (f as { id?: unknown }).id === "string" &&
        typeof (f as { label?: unknown }).label === "string",
    )
    .map((f) => ({ id: f.id, label: f.label }));
}

export async function PUT(
  request: Request,
  env: { DB: D1Database },
  params: { id: string }
): Promise<Response> {
  const body = (await request.json()) as {
    name?: string;
    fields?: HeaderField[];
  };

  if (!body.name || body.name.trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const now = Date.now();

  const result = await env.DB.prepare(
    "UPDATE headers SET name = ?, fields = ?, updated_at = ? WHERE id = ?"
  )
    .bind(body.name.trim(), JSON.stringify(parseFields(body.fields)), now, params.id)
    .run();

  if (!result.meta.changes) {
    return Response.json({ error: "Header não encontrado." }, { status: 404 });
  }

  return Response.json({
    header: {
      id: params.id,
      name: body.name.trim(),
      fields: parseFields(body.fields),
      updatedAt: new Date(now).toISOString(),
    },
  });
}

export async function DELETE(
  _request: Request,
  env: { DB: D1Database },
  params: { id: string }
): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM headers WHERE id = ?")
    .bind(params.id)
    .run();

  if (!result.meta.changes) {
    return Response.json({ error: "Header não encontrado." }, { status: 404 });
  }

  await env.DB.prepare(
    "UPDATE checklists SET header_id = NULL WHERE header_id = ?"
  )
    .bind(params.id)
    .run();

  return Response.json({ deleted: true });
}
