import type { HeaderField } from "../../domain/header";

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

export async function GET(
  _request: Request,
  env: { DB: D1Database }
): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, name, fields, updated_at FROM headers ORDER BY updated_at DESC LIMIT 100"
  ).all();

  const headers = (results as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    fields: parseFields(row.fields),
    updatedAt: new Date(row.updated_at as number).toISOString(),
  }));

  return Response.json({ headers });
}

export async function POST(
  request: Request,
  env: { DB: D1Database }
): Promise<Response> {
  const body = (await request.json()) as {
    name?: string;
    fields?: HeaderField[];
  };

  if (!body.name || body.name.trim().length === 0) {
    return Response.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const fields = parseFields(body.fields);

  await env.DB.prepare(
    "INSERT INTO headers (id, name, fields, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(id, body.name.trim(), JSON.stringify(fields), now, now)
    .run();

  return Response.json(
    {
      header: {
        id,
        name: body.name.trim(),
        fields,
        updatedAt: new Date(now).toISOString(),
      },
    },
    { status: 201 }
  );
}
