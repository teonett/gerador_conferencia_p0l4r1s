'use client';

import type { Template } from '../../domain/checklist';
import { COLORS } from '../../domain/constants';
import { TemplateCard } from '../templates/TemplateCard';

interface DashboardProps {
  templates: Template[];
  onRun: (template: Template) => void;
  onNew: () => void;
}

export function Dashboard({ templates, onRun, onNew }: DashboardProps) {
  return (
    <div>
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.mint})`,
          borderRadius: 16,
          padding: '32px',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>
          Olá, Teo
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>
          Tudo certo, sem esquecer nada.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="primary" onClick={onNew}>
            Novo checklist
          </button>
          <button
            className="secondary"
            onClick={() => {
              if (templates.length > 0) onRun(templates[0]);
            }}
          >
            Executar agora
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.green }}>
            {templates.length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Modelos ativos</div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.orange }}>24</div>
          <div style={{ fontSize: 14, color: '#666' }}>Concluídos no mês</div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.green }}>4 min</div>
          <div style={{ fontSize: 14, color: '#666' }}>Tempo médio</div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
        Modelos recentes
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {templates.slice(0, 3).map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onRun={() => onRun(template)}
          />
        ))}
      </div>
    </div>
  );
}
