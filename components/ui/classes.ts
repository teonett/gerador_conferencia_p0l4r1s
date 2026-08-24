import type { AnswerClass } from '../../domain/metrics';

const BTN_BASE = 'cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium';

export const BTN_PRIMARY = `${BTN_BASE} bg-corPadrao text-white`;
export const BTN_SECONDARY = `${BTN_BASE} bg-surface text-corPadrao border border-line`;
export const BTN_SUCCESS = `${BTN_BASE} bg-metric-yes text-white`;
export const BTN_DANGER = `${BTN_BASE} bg-metric-no text-white`;

export const INPUT =
  'w-full px-3 py-2.5 bg-transparent border border-line rounded-lg text-sm text-ink focus:outline-none focus:border-corPadrao';

export const FIELD_LABEL = 'block text-sm mb-1';

export const CARD = 'bg-surface rounded-xl';

export const HEADER_DATETIME = 'flex gap-3 flex-wrap';
export const HEADER_DATE_INPUT = 'w-[170px]';
export const HEADER_TIME_INPUT = 'w-[110px]';
export const HEADER_GRID = 'grid grid-cols-2 gap-3 mt-3 min-[720px]:grid-cols-4';

export const METRIC_BG: Record<AnswerClass, string> = {
  yes: 'bg-metric-yes',
  no: 'bg-metric-no',
  other: 'bg-metric-other',
};

export const zebraRow = (index: number): string => (index % 2 === 1 ? 'bg-cream' : 'bg-surface');
