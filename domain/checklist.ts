export type AnswerType = 'text' | 'choice';
export type SelectionType = 'single' | 'multiple';
export type View = 'home' | 'templates' | 'run' | 'report';

export interface Item {
  id: string;
  title: string;
  required: boolean;
  options: string[];
  answerType: AnswerType;
  selection: SelectionType;
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
