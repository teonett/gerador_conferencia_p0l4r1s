import { CIPA_SEED } from "@/db/seed";
import { Template } from "@/domain/checklist";

export async function GET(
  request: Request,
  env: { DB: D1Database },
): Promise<Response> {
  const url = new URL(request.url);
  const shareToken = url.searchParams.get("share");

  if (shareToken) {
    const rows = await env.DB.prepare(
      "SELECT * FROM checklists WHERE share_token = ? OR id = ?",
    )
      .bind(shareToken, shareToken)
      .first();

    if (!rows) {
      return Response.json(
        { error: "Checklist não encontrado." },
        { status: 404 },
      );
    }

    const template: Template = {
      id: rows.id as string,
      title: rows.title as string,
      description: rows.description as string,
      category: rows.category as string,
      items: JSON.parse(rows.items as string),
      headerId: (rows.header_id as string | null) || undefined,
      shareToken: rows.share_token as string,
    };

    return Response.json({ checklist: template });
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM checklists ORDER BY updated_at DESC LIMIT 100",
  ).all();

  const checklists: Template[] = results.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    items: JSON.parse(row.items as string),
    headerId: (row.header_id as string | null) || undefined,
    shareToken: row.share_token as string,
  }));

  if (checklists.length === 0) {
    await env.DB.prepare(
      "INSERT INTO checklists (id, title, description, category, items, share_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        CIPA_SEED.id,
        CIPA_SEED.title,
        CIPA_SEED.description,
        CIPA_SEED.category,
        JSON.stringify(CIPA_SEED.items),
        CIPA_SEED.shareToken!,
        Date.now(),
        Date.now(),
      )
      .run();

    checklists.push(CIPA_SEED);
  }

  return Response.json({ checklists });
}

export async function POST(
  request: Request,
  env: { DB: D1Database },
): Promise<Response> {
  const body = await request.json();

  if (!body.title || !body.items || body.items.length === 0) {
    return Response.json(
      { error: "Nome e questões são obrigatórios." },
      { status: 400 },
    );
  }

  const id = body.id || crypto.randomUUID();
  const shareToken = body.shareToken || crypto.randomUUID().slice(0, 8);
  const now = Date.now();

  await env.DB.prepare(
    "INSERT INTO checklists (id, title, description, category, items, header_id, share_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      id,
      body.title,
      body.description || "",
      body.category || "Geral",
      JSON.stringify(body.items),
      typeof body.headerId === "string" && body.headerId ? body.headerId : null,
      shareToken,
      now,
      now,
    )
    .run();

  const template: Template = {
    id,
    title: body.title,
    description: body.description || "",
    category: body.category || "Geral",
    items: body.items,
    headerId: typeof body.headerId === "string" && body.headerId ? body.headerId : undefined,
    shareToken,
  };

  return Response.json({ checklist: template }, { status: 201 });
}
