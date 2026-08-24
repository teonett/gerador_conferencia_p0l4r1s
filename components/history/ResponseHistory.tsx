import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Template } from '../../domain/checklist';
import type { HeaderModel } from '../../domain/header';
import { CONFIRM_DELETE_PHRASE } from '../../domain/constants';
import { classifyAnswer } from '../../domain/metrics';
import { generatePdf } from '../../lib/pdf';
import { MainHero } from '../main/MainHero';
import { ConfirmModal } from '../main/ConfirmModal';
import { BTN_DANGER, BTN_PRIMARY } from '../ui/classes';

interface HistoryItem {
  id: string;
  checklistId: string;
  checklistTitle: string;
  category: string;
  checklistHeaderId: string | null;
  answers: Record<string, string[]>;
  metadata: Record<string, string>;
  observations: string;
  photos: Record<string, string[]>;
  photoCount: number;
  signatureName: string;
  completedAt: number;
}

interface ResponseHistoryProps {
  templates: Template[];
  headers: HeaderModel[];
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

export function ResponseHistory({ templates, headers }: ResponseHistoryProps) {
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

  const handlePdf = async (item: HistoryItem) => {
    const template = templateById.get(item.checklistId);
    if (!template) return;

    const photoBlobs: Record<string, Blob[]> = {};
    for (const [itemId, keys] of Object.entries(item.photos || {})) {
      const blobs = (
        await Promise.all(
          keys.map(async (key) => {
            try {
              const res = await fetch(`/api/files/${key}`);
              return res.ok ? ((await res.blob()) as Blob) : null;
            } catch {
              return null;
            }
          })
        )
      ).filter((blob): blob is Blob => blob !== null);
      if (blobs.length > 0) photoBlobs[itemId] = blobs;
    }

    generatePdf(
      template,
      item.answers,
      item.metadata,
      item.observations,
      item.signatureName || '',
      new Date(item.completedAt).toISOString(),
      photoBlobs,
      item.checklistHeaderId ? headers.find((h) => h.id === item.checklistHeaderId) : undefined
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
    content = <p className="text-gray-600">Carregando histórico...</p>;
  } else if (error) {
    content = <p className="text-orange">{error}</p>;
  } else if (items.length === 0) {
    content = (
      <p className="text-gray-600">
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
          className={`bg-surface rounded-xl p-4 mb-3 border ${
            isExpanded ? 'border-corPadrao' : 'border-line'
          }`}
        >
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <p className="font-semibold">{item.checklistTitle}</p>
              <p className="text-[13px] text-gray-600">{item.category}</p>
            </div>
            <span className="text-[13px] text-gray-600">
              {new Date(item.completedAt).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 text-[13px]">
            <span>🟩 Sim: <strong>{counts.yes}</strong></span>
            <span>🟥 Não: <strong>{counts.no}</strong></span>
            <span>🟨 Outros: <strong>{counts.other}</strong></span>
            <span className="text-gray-600">· {answered} pergunta(s) respondida(s)</span>
            {item.photoCount > 0 && <span>📷 {item.photoCount} foto(s)</span>}
          </div>

          {Object.keys(item.metadata).length > 0 && (
            <div className="mt-2.5 text-[13px] text-gray-600">
              {Object.entries(item.metadata)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <span key={key} className="mr-3">
                    <strong>{key}:</strong> {value}
                  </span>
                ))}
            </div>
          )}

          {item.observations && (
            <p className="mt-2.5 text-[13px]">
              <strong>Observações:</strong> {item.observations}
            </p>
          )}

          <div className="flex gap-2 mt-3.5">
            <button
              className={`${BTN_PRIMARY} text-xs!`}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              {isExpanded ? 'Ocultar respostas' : 'Ver respostas'}
            </button>
            <button
              className={`${BTN_DANGER} text-xs!`}
              onClick={() => setDeleteTarget(item)}
            >
              🗑 Excluir
            </button>
            {isExpanded && (
              <button
                className={`${BTN_PRIMARY} text-xs!`}
                onClick={() => handlePdf(item)}
                disabled={!template}
                title={template ? undefined : 'Modelo não encontrado; PDF indisponível'}
              >
                📄 Baixar PDF
              </button>
            )}
          </div>

          {isExpanded && (
            <div className="mt-3 border-t border-line pt-3">
              {template ? (
                template.items.map((tplItem, index) => {
                  const values = item.answers[tplItem.id];
                  return (
                    <div key={tplItem.id} className="mb-2.5 text-sm">
                      <p className="font-medium">
                        {index + 1}. {tplItem.title}
                      </p>
                      <p className="text-corPadrao mt-0.5">
                        Resposta: {(values || []).join(', ') || '—'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-[13px] text-orange">
                  Modelo não disponível — exibindo apenas os valores registrados:
                </p>
              )}
              {!template &&
                Object.entries(item.answers).map(([itemId, values]) => (
                  <p key={itemId} className="text-[13px]">
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
        <p className="text-orange mb-3">{deleteError}</p>
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
