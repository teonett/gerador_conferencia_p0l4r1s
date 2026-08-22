import { SETTINGS } from "../../../domain/constants";

const LOGO_KEY = "logo_r2_key";
const BG_KEY = "logo_bg";

interface SettingsRow {
  key: string;
  value: string;
}

async function readSettings(env: { DB: D1Database }) {
  const { results } = await env.DB.prepare(
    "SELECT key, value FROM settings WHERE key IN (?, ?)"
  )
    .bind(LOGO_KEY, BG_KEY)
    .all<SettingsRow>();

  const map = new Map(results.map((row) => [row.key, row.value]));
  const logoKey = map.get(LOGO_KEY) || null;
  const logoBg = map.get(BG_KEY) || SETTINGS.logoBgDefault;

  return {
    logoUrl: logoKey ? `/api/files/${logoKey}` : null,
    logoKey,
    logoBg,
  };
}

export async function GET(
  _request: Request,
  env: { DB: D1Database }
): Promise<Response> {
  const { logoUrl, logoBg } = await readSettings(env);
  return Response.json({ logoUrl, logoBg });
}

export async function POST(
  request: Request,
  env: { DB: D1Database; BUCKET: R2Bucket }
): Promise<Response> {
  const formData = await request.formData();
  const logo = formData.get("logo");
  const bgRaw = formData.get("bg");
  const bg =
    typeof bgRaw === "string" && SETTINGS.logoBgOptions.includes(bgRaw)
      ? bgRaw
      : null;

  const upsertBg = async () => {
    if (!bg) return;
    await env.DB.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
      .bind(BG_KEY, bg)
      .run();
  };

  if (!logo || !(logo instanceof File)) {
    if (!bg) {
      return Response.json(
        { error: "Envie o arquivo de imagem ou a cor de fundo." },
        { status: 400 }
      );
    }
    await upsertBg();
    const { logoUrl } = await readSettings(env);
    return Response.json({ logoUrl, logoBg: bg });
  }

  if (!["image/png", "image/jpeg"].includes(logo.type)) {
    return Response.json(
      { error: "Formato inválido. Use PNG ou JPEG." },
      { status: 400 }
    );
  }
  if (logo.size > SETTINGS.logoMaxBytes) {
    return Response.json(
      { error: "Imagem excede o tamanho máximo." },
      { status: 400 }
    );
  }

  const previous = await readSettings(env);

  const filename = logo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const r2Key = `settings/logo-${crypto.randomUUID().slice(0, 8)}-${filename}`;

  await env.BUCKET.put(r2Key, logo, {
    httpMetadata: { contentType: logo.type },
  });

  if (previous.logoKey) {
    await env.BUCKET.delete(previous.logoKey).catch(() => undefined);
  }

  await env.DB.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  )
    .bind(LOGO_KEY, r2Key)
    .run();

  await upsertBg();

  return Response.json({ logoUrl: `/api/files/${r2Key}`, logoBg: bg || previous.logoBg }, { status: 201 });
}
