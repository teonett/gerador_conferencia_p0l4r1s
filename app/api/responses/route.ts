import type { Answers, Metadata, Item } from '../../../domain/checklist';

export interface ResponseHistoryItem {
  id: string;
  checklistId: string;
  checklistTitle: string;
  category: string;
  checklistHeaderId: string | null;
  answers: Answers;
  metadata: Metadata;
  observations: string;
  photos: Record<string, string[]>;
  photoCount: number;
  signatureName: string;
  extraItems: Item[];
  completedAt: number;
  updatedAt: number | null;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function countPhotos(photos: unknown): number {
  const parsed = parseJson<Record<string, string[] | string>>(photos, {});
  return Object.values(parsed).reduce(
    (total, entry) => total + (Array.isArray(entry) ? entry.length : entry ? 1 : 0),
    0
  );
}

export async function GET(
  _request: Request,
  env: { DB: D1Database }
): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT r.id, r.checklist_id, r.answers, r.metadata, r.observations, r.photos, r.signature_name, r.extra_items, r.completed_at, r.updated_at,
            COALESCE(c.title, 'Modelo removido') AS checklist_title,
            COALESCE(c.category, '') AS category,
            c.header_id AS checklist_header_id
     FROM responses r
     LEFT JOIN checklists c ON c.id = r.checklist_id
     ORDER BY r.completed_at DESC
     LIMIT 100`
  ).all();

  const responses: ResponseHistoryItem[] = (results as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    checklistId: row.checklist_id as string,
    checklistTitle: row.checklist_title as string,
    category: row.category as string,
    checklistHeaderId: (row.checklist_header_id as string | null) || null,
    answers: parseJson<Answers>(row.answers, {}),
    metadata: parseJson<Metadata>(row.metadata, {}),
    observations: typeof row.observations === 'string' ? row.observations : '',
    photos: parseJson<Record<string, string[]>>(row.photos, {}),
    photoCount: countPhotos(row.photos),
    signatureName: typeof row.signature_name === 'string' ? row.signature_name : '',
    extraItems: parseJson<Item[]>(row.extra_items, []),
    completedAt: row.completed_at as number,
    updatedAt: row.updated_at as number | null,
  }));

  return Response.json({ responses });
}
