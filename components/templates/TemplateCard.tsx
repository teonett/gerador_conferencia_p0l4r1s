import type { Template } from '../../domain/checklist';
import { COLORS } from '../../domain/constants';

interface TemplateCardProps {
  template: Template;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplateCard({ template, onRun, onEdit, onDelete }: TemplateCardProps) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        padding: 20,
        border: `1px solid ${COLORS.line}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <span
            style={{
              fontSize: 12,
              color: COLORS.green,
              backgroundColor: COLORS.mint,
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {template.category}
          </span>
          <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{template.title}</h4>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{template.description}</p>
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            {template.items.length} pergunta{template.items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="primary" onClick={onRun}>
          Executar
        </button>
        <button className="secondary" onClick={onEdit}>
          Editar
        </button>
        <button
          className="secondary"
          onClick={onDelete}
          style={{ color: COLORS.orange }}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
