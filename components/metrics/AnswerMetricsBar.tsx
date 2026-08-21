import { useMemo } from 'react';
import type { Answers, Item } from '../../domain/checklist';
import { COLORS, METRIC_COLORS } from '../../domain/constants';
import {
  classifyAnswer,
  collectChoiceOptions,
  computeAnswerMetrics,
  type AnswerClass,
} from '../../domain/metrics';

const CLASS_COLORS: Record<AnswerClass | 'pending', string> = {
  yes: METRIC_COLORS.yes,
  no: METRIC_COLORS.no,
  other: METRIC_COLORS.other,
  pending: '#9ca3af',
};

function MetricChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        border: `1px solid ${COLORS.line}`,
        background: 'white',
        fontSize: 13,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}: <strong>{value}</strong>
    </span>
  );
}

interface AnswerMetricsBarProps {
  items: Item[];
  answers: Answers;
}

export function AnswerMetricsBar({ items, answers }: AnswerMetricsBarProps) {
  const metrics = useMemo(() => computeAnswerMetrics(items, answers), [items, answers]);
  const options = useMemo(() => collectChoiceOptions(items), [items]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontSize: 13,
          color: '#666',
        }}
      >
        <span>
          {metrics.answered} de {metrics.total} respondidas
        </span>
        <span>{metrics.total > 0 ? Math.round((metrics.answered / metrics.total) * 100) : 0}%</span>
      </div>
      <div
        style={{
          display: 'flex',
          height: 10,
          borderRadius: 5,
          overflow: 'hidden',
          background: METRIC_COLORS.pending,
        }}
      >
        {metrics.yes > 0 && (
          <div
            title={`Sim: ${metrics.yes}`}
            style={{ flexGrow: metrics.yes, background: METRIC_COLORS.yes, transition: 'flex-grow 0.3s' }}
          />
        )}
        {metrics.no > 0 && (
          <div
            title={`Não: ${metrics.no}`}
            style={{ flexGrow: metrics.no, background: METRIC_COLORS.no, transition: 'flex-grow 0.3s' }}
          />
        )}
        {metrics.other > 0 && (
          <div
            title={`Outros: ${metrics.other}`}
            style={{ flexGrow: metrics.other, background: METRIC_COLORS.other, transition: 'flex-grow 0.3s' }}
          />
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {options.map((option) => (
          <MetricChip
            key={option}
            label={option}
            value={metrics.byOption[option] || 0}
            color={CLASS_COLORS[classifyAnswer(option)]}
          />
        ))}
        <MetricChip label="Pendentes" value={metrics.pending} color={CLASS_COLORS.pending} />
      </div>
    </div>
  );
}
