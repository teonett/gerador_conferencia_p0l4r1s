import { useMemo } from "react";
import type { Answers, Item } from "../../domain/checklist";
import { METRIC_BG } from "../ui/classes";
import {
  classifyAnswer,
  collectChoiceOptions,
  computeAnswerMetrics,
  type AnswerClass,
} from "../../domain/metrics";

const CLASS_DOT: Record<AnswerClass | "pending", string> = {
  yes: METRIC_BG.yes,
  no: METRIC_BG.no,
  other: METRIC_BG.other,
  pending: "bg-[#9ca3af]",
};

function MetricChip({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line bg-surface text-[13px]">
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      {label}: <strong>{value}</strong>
    </span>
  );
}

interface AnswerMetricsBarProps {
  items: Item[];
  answers: Answers;
}

export function AnswerMetricsBar({ items, answers }: AnswerMetricsBarProps) {
  const metrics = useMemo(
    () => computeAnswerMetrics(items, answers),
    [items, answers],
  );
  const options = useMemo(() => collectChoiceOptions(items), [items]);

  return (
    <div>
      <div className="flex justify-between mb-1.5 text-[13px] text-gray-600">
        <span>
          {metrics.answered} de {metrics.total} respondidas
        </span>
        <span>
          {metrics.total > 0
            ? Math.round((metrics.answered / metrics.total) * 100)
            : 0}
          %
        </span>
      </div>
      <div className="flex h-2.5 rounded-[5px] overflow-hidden bg-metric-pending">
        {metrics.yes > 0 && (
          <div
            title={`Sim: ${metrics.yes}`}
            style={{ flexGrow: metrics.yes }}
            className={`${METRIC_BG.yes} transition-[flex-grow] duration-300`}
          />
        )}
        {metrics.no > 0 && (
          <div
            title={`Não: ${metrics.no}`}
            style={{ flexGrow: metrics.no }}
            className={`${METRIC_BG.no} transition-[flex-grow] duration-300`}
          />
        )}
        {metrics.other > 0 && (
          <div
            title={`Outros: ${metrics.other}`}
            style={{ flexGrow: metrics.other }}
            className={`${METRIC_BG.other} transition-[flex-grow] duration-300`}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2.5">
        {options.map((option) => (
          <MetricChip
            key={option}
            label={option}
            value={metrics.byOption[option] || 0}
            dotClass={CLASS_DOT[classifyAnswer(option)]}
          />
        ))}
        <MetricChip
          label="Pendentes"
          value={metrics.pending}
          dotClass={CLASS_DOT.pending}
        />
      </div>
    </div>
  );
}
