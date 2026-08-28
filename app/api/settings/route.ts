import { SETTINGS } from "../../../domain/constants";

const LOGO_KEY = "logo_r2_key";
const BG_KEY = "logo_bg";
const COLOR_KEY = "primary_color";

interface SettingsRow {
  key: string;
  value: string;
}

async function readSettings(env: { DB: D1Database }) {
  const { results } = await env.DB.prepare(
    "SELECT key, value FROM settings WHERE key IN (?, ?, ?)"
  )
    .bind(LOGO_KEY, BG_KEY, COLOR_KEY)
    .all<SettingsRow>();

  const map = new Map(results.map((row) => [row.key, row.value]));
  const logoKey = map.get(LOGO_KEY) || null;
  const logoBg = map.get(BG_KEY) || SETTINGS.logoBgDefault;
  const primaryColor = map.get(COLOR_KEY) || SETTINGS.primaryColorDefault;

  return {
    logoUrl: logoKey ? `/api/files/${logoKey}` : null,
    logoKey,
    logoBg,
    primaryColor,
  };
}

export async function GET(
  _request: Request,
  env: { DB: D1Database }
): Promise<Response> {
  const { logoUrl, logoBg, primaryColor } = await readSettings(env);
  return Response.json({ logoUrl, logoBg, primaryColor });
}

export async function POST(
  request: Request,
  env: { DB: D1Database; BUCKET: R2Bucket }
): Promise<Response> {
  const formData = await request.formData();
  const logo = formData.get("logo");
  const bgRaw = formData.get("bg");
  const colorRaw = formData.get("primaryColor");
  const bg =
    typeof bgRaw === "string" && SETTINGS.logoBgOptions.includes(bgRaw)
      ? bgRaw
      : null;
  const primaryColor =
    typeof colorRaw === "string" && /^#[0-9a-fA-F]{6}$/.test(colorRaw)
      ? colorRaw
      : null;

  const upsertBg = async () => {
    if (!bg) return;
    await env.DB.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
      .bind(BG_KEY, bg)
      .run();
  };

  const upsertColor = async () => {
    if (!primaryColor) return;
    await env.DB.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
      .bind(COLOR_KEY, primaryColor)
      .run();
  };

  if (!logo || !(logo instanceof File)) {
    if (!bg && !primaryColor) {
      return Response.json(
        { error: "Envie o arquivo de imagem, a cor de fundo ou a cor primária." },
        { status: 400 }
      );
    }
    await upsertBg();
    await upsertColor();
    const { logoUrl, primaryColor: savedColor } = await readSettings(env);
    return Response.json({ logoUrl, logoBg: bg || SETTINGS.logoBgDefault, primaryColor: savedColor });
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
  await upsertColor();

  return Response.json({ logoUrl: `/api/files/${r2Key}`, logoBg: bg || previous.logoBg, primaryColor: primaryColor || previous.primaryColor }, { status: 201 });
}
