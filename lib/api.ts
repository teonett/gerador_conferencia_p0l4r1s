import type { Template } from '../domain/checklist';

export async function fetchChecklists(): Promise<Template[]> {
  const res = await fetch('/api/checklists');
  const data = await res.json();
  return data.checklists || [];
}

export async function fetchChecklistByShare(shareToken: string): Promise<Template | null> {
  const res = await fetch(`/api/checklists?share=${shareToken}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.checklist || null;
}

export async function saveChecklist(template: Template): Promise<Template> {
  const method = template.id ? 'PUT' : 'POST';
  const url = template.id ? `/api/checklists/${template.id}` : '/api/checklists';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });

  const data = await res.json();
  return data.checklist || template;
}

export async function saveResponse(
  checklistId: string,
  answers: Record<string, string[]>,
  metadata: Record<string, string>,
  observations: string,
  signature: string,
  confirmedAt: string,
  photos: Record<string, File>
): Promise<string> {
  const formData = new FormData();
  formData.append(
    'answers',
    JSON.stringify({ answers, metadata, observations, signature, confirmedAt })
  );

  for (const [itemId, file] of Object.entries(photos)) {
    formData.append(`photo:${itemId}`, file);
  }

  const res = await fetch(`/api/checklists/${checklistId}/responses`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return data.id;
}
