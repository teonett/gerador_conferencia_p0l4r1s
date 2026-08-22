import type { Answers, Metadata } from '../../domain/checklist';

export interface ResponseHistoryItem {
  id: string;
  checklistId: string;
  checklistTitle: string;
  category: string;
  answers: Answers;
  metadata: Metadata;
  observations: string;
  photoCount: number;
  completedAt: number;
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
    `SELECT r.id, r.checklist_id, r.answers, r.metadata, r.observations, r.photos, r.completed_at,
            COALESCE(c.title, 'Modelo removido') AS checklist_title,
            COALESCE(c.category, '') AS category
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
    answers: parseJson<Answers>(row.answers, {}),
    metadata: parseJson<Metadata>(row.metadata, {}),
    observations: typeof row.observations === 'string' ? row.observations : '',
    photoCount: countPhotos(row.photos),
    completedAt: row.completed_at as number,
  }));

  return Response.json({ responses });
}
