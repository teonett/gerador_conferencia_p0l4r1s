export type AnswerType = 'text' | 'choice';
export type SelectionType = 'single' | 'multiple';
export type View = 'home' | 'templates' | 'run' | 'report' | 'history';

export interface Item {
  id: string;
  title: string;
  required: boolean;
  options: string[];
  answerType: AnswerType;
  selection: SelectionType;
  defaultOption?: string;
}

export interface Field {
  id: string;
  label: string;
  type: 'text' | 'date';
  required?: boolean;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  items: Item[];
  fields?: Field[];
  observations?: boolean;
  source?: string;
  shareToken?: string;
  updatedAt?: string;
}

export type Answers = Record<string, string[]>;
export type Metadata = Record<string, string>;

export function buildInitialAnswers(items: Item[]): Answers {
  const initial: Answers = {};
  for (const item of items) {
    if (
      item.answerType === 'choice' &&
      item.defaultOption &&
      item.options.includes(item.defaultOption)
    ) {
      initial[item.id] = [item.defaultOption];
    }
  }
  return initial;
}

export interface ResponsePayload {
  id: string;
  checklistId: string;
  answers: Answers;
  metadata: Metadata;
  observations: string;
  signature: string;
  confirmedAt: string;
  completedAt: number;
  photos: Record<string, string>;
}
