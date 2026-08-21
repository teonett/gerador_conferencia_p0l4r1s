import { useMemo, useState } from 'react';
import type { Item } from '../../domain/checklist';
import { collectChoiceOptions } from '../../domain/metrics';

interface BulkDefaultControlProps {
  items: Item[];
  onApply: (option: string) => void;
}

export function BulkDefaultControl({ items, onApply }: BulkDefaultControlProps) {
  const [defaultOption, setDefaultOption] = useState('');
  const options = useMemo(() => collectChoiceOptions(items), [items]);

  if (options.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <label style={{ fontSize: 14, fontWeight: 500 }}>Resposta padrão</label>
      <select
        value={defaultOption}
        onChange={(e) => setDefaultOption(e.target.value)}
        style={{ width: 220 }}
      >
        <option value="">Selecione uma opção</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        className="secondary"
        onClick={() => onApply(defaultOption)}
        disabled={!defaultOption}
        style={{
          opacity: defaultOption ? 1 : 0.5,
          cursor: defaultOption ? 'pointer' : 'not-allowed',
        }}
      >
        Aplicar a todas as perguntas
      </button>
    </div>
  );
}
