import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Template } from '../../domain/checklist';
import { COLORS, CONFIRM_DELETE_PHRASE } from '../../domain/constants';
import { classifyAnswer } from '../../domain/metrics';
import { generatePdf } from '../../lib/pdf';
import { MainHero } from '../main/MainHero';
import { ConfirmModal } from '../main/ConfirmModal';

interface HistoryItem {
  id: string;
  checklistId: string;
  checklistTitle: string;
  category: string;
  answers: Record<string, string[]>;
  metadata: Record<string, string>;
  observations: string;
  photoCount: number;
  completedAt: number;
}

interface ResponseHistoryProps {
  templates: Template[];
}

function summarize(answers: Record<string, string[]>) {
  let yes = 0;
  let no = 0;
  let other = 0;
  for (const values of Object.values(answers)) {
    for (const value of values || []) {
      const answerClass = classifyAnswer(value);
      if (answerClass === 'yes') yes++;
      else if (answerClass === 'no') no++;
      else other++;
    }
  }
  return { yes, no, other };
}

export function ResponseHistory({ templates }: ResponseHistoryProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetch('/api/responses')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: unknown) => {
        const payload = data as { responses?: HistoryItem[] };
        if (payload.responses) setItems(payload.responses);
      })
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false));
  }, []);

  const templateById = new Map(templates.map((t) => [t.id, t]));

  const handlePdf = (item: HistoryItem) => {
    const template = templateById.get(item.checklistId);
    if (!template) return;
    generatePdf(
      template,
      item.answers,
      item.metadata,
      item.observations,
      '',
      new Date(item.completedAt).toISOString()
    );
  };

  const handleDelete = async (item: HistoryItem) => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/responses/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((r) => r.id !== item.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError('Não foi possível excluir o registro. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  let content: ReactNode;

  if (loading) {
    content = <p style={{ color: '#666' }}>Carregando histórico...</p>;
  } else if (error) {
    content = <p style={{ color: COLORS.orange }}>{error}</p>;
  } else if (items.length === 0) {
    content = (
      <p style={{ color: '#666' }}>
        Nenhum preenchimento registrado ainda. Finalize um checklist para vê-lo aqui.
      </p>
    );
  } else {
    content = items.map((item) => {
      const counts = summarize(item.answers);
      const answered = Object.values(item.answers).filter((v) => v && v.length > 0).length;
      const isExpanded = expandedId === item.id;
      const template = templateById.get(item.checklistId);
      return (
        <div
          key={item.id}
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${isExpanded ? COLORS.corPadrao : COLORS.line}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ fontWeight: 600 }}>{item.checklistTitle}</p>
              <p style={{ fontSize: 13, color: '#666' }}>{item.category}</p>
            </div>
            <span style={{ fontSize: 13, color: '#666' }}>
              {new Date(item.completedAt).toLocaleString('pt-BR')}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, fontSize: 13 }}>
            <span>🟩 Sim: <strong>{counts.yes}</strong></span>
            <span>🟥 Não: <strong>{counts.no}</strong></span>
            <span>🟨 Outros: <strong>{counts.other}</strong></span>
            <span style={{ color: '#666' }}>· {answered} pergunta(s) respondida(s)</span>
            {item.photoCount > 0 && <span>📷 {item.photoCount} foto(s)</span>}
          </div>

          {Object.keys(item.metadata).length > 0 && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#666' }}>
              {Object.entries(item.metadata)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <span key={key} style={{ marginRight: 12 }}>
                    <strong>{key}:</strong> {value}
                  </span>
                ))}
            </div>
          )}

          {item.observations && (
            <p style={{ marginTop: 10, fontSize: 13 }}>
              <strong>Observações:</strong> {item.observations}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              className="secondary"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              style={{ fontSize: 12 }}
            >
              {isExpanded ? 'Ocultar respostas' : 'Ver respostas'}
            </button>
            <button
              className="secondary"
              onClick={() => setDeleteTarget(item)}
              style={{ fontSize: 12, color: COLORS.orange }}
            >
              🗑 Excluir
            </button>
            {isExpanded && (
              <button
                className="primary"
                onClick={() => handlePdf(item)}
                disabled={!template}
                title={template ? undefined : 'Modelo não encontrado; PDF indisponível'}
                style={{ fontSize: 12 }}
              >
                📄 Baixar PDF
              </button>
            )}
          </div>

          {isExpanded && (
            <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
              {template ? (
                template.items.map((tplItem, index) => {
                  const values = item.answers[tplItem.id];
                  return (
                    <div key={tplItem.id} style={{ marginBottom: 10, fontSize: 14 }}>
                      <p style={{ fontWeight: 500 }}>
                        {index + 1}. {tplItem.title}
                      </p>
                      <p style={{ color: COLORS.corPadrao, marginTop: 2 }}>
                        Resposta: {(values || []).join(', ') || '—'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: 13, color: COLORS.orange }}>
                  Modelo não disponível — exibindo apenas os valores registrados:
                </p>
              )}
              {!template &&
                Object.entries(item.answers).map(([itemId, values]) => (
                  <p key={itemId} style={{ fontSize: 13 }}>
                    {itemId}: {(values || []).join(', ') || '—'}
                  </p>
                ))}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div>
      <MainHero
        title="Histórico"
        description="Consulte os preenchimentos anteriores, revise as respostas e baixe o relatório em PDF."
      />
      {deleteError && (
        <p style={{ color: COLORS.orange, marginBottom: 12 }}>{deleteError}</p>
      )}
      {content}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir registro do histórico"
        description={
          deleteTarget
            ? `"${deleteTarget.checklistTitle}" de ${new Date(
                deleteTarget.completedAt
              ).toLocaleString('pt-BR')} será removido junto com as fotos. Esta ação é permanente.`
            : ''
        }
        confirmPhrase={CONFIRM_DELETE_PHRASE}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir definitivamente'}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
