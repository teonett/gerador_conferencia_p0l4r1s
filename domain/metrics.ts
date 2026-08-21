import type { Answers, Item } from './checklist';

export type AnswerClass = 'yes' | 'no' | 'other';

export function classifyAnswer(answer: string): AnswerClass {
  const normalized = answer.trim().toLowerCase();
  if (normalized === 'sim') return 'yes';
  if (normalized === 'não' || normalized === 'nao') return 'no';
  return 'other';
}

export interface AnswerMetrics {
  total: number;
  answered: number;
  pending: number;
  yes: number;
  no: number;
  other: number;
  byOption: Record<string, number>;
}

export function computeAnswerMetrics(items: Item[], answers: Answers): AnswerMetrics {
  const byOption: Record<string, number> = {};
  let yes = 0;
  let no = 0;
  let other = 0;
  let answered = 0;

  for (const item of items) {
    const current = answers[item.id];
    if (!current || current.length === 0) continue;
    answered++;
    for (const answer of current) {
      byOption[answer] = (byOption[answer] || 0) + 1;
      const answerClass = classifyAnswer(answer);
      if (answerClass === 'yes') yes++;
      else if (answerClass === 'no') no++;
      else other++;
    }
  }

  return {
    total: items.length,
    answered,
    pending: items.length - answered,
    yes,
    no,
    other,
    byOption,
  };
}

export function applyDefaultAnswer(items: Item[], answers: Answers, option: string): Answers {
  const next: Answers = { ...answers };
  for (const item of items) {
    if (item.answerType !== 'choice' || !item.options.includes(option)) continue;
    next[item.id] = [option];
  }
  return next;
}

export function collectChoiceOptions(items: Item[]): string[] {
  const seen = new Set<string>();
  for (const item of items) {
    if (item.answerType !== 'choice') continue;
    for (const option of item.options) seen.add(option);
  }
  return [...seen];
}
