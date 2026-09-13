import type { Item, Answers } from './schema';

export type { Template, Item, Field, Answers, Metadata } from './schema';

export type AnswerType = Item['answerType'];
export type SelectionType = Item['selection'];
export type View = 'home' | 'templates' | 'headers' | 'run' | 'report' | 'history' | 'settings';

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
