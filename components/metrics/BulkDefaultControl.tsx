import { useMemo, useState } from 'react';
import type { Item } from '../../domain/checklist';
import { collectChoiceOptions } from '../../domain/metrics';
import { BTN_SECONDARY, FIELD_LABEL, INPUT } from '../ui/classes';

interface BulkDefaultControlProps {
  items: Item[];
  onApply: (option: string) => void;
}

export function BulkDefaultControl({ items, onApply }: BulkDefaultControlProps) {
  const [defaultOption, setDefaultOption] = useState('');
  const options = useMemo(() => collectChoiceOptions(items), [items]);

  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6">
      <label className={`${FIELD_LABEL} font-medium`}>Resposta padrão</label>
      <select
        value={defaultOption}
        onChange={(e) => setDefaultOption(e.target.value)}
        className={`${INPUT} w-55`}
      >
        <option value="">Selecione uma opção</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        className={`${BTN_SECONDARY} disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={() => onApply(defaultOption)}
        disabled={!defaultOption}
      >
        Aplicar a todas as perguntas
      </button>
    </div>
  );
}
