import { useState } from 'react';
import type { Template, Item } from '../../domain/checklist';
import { COLORS } from '../../domain/constants';
import { applyDefaultAnswer } from '../../domain/metrics';
import { generatePdf } from '../../lib/pdf';
import { AnswerMetricsBar } from '../metrics/AnswerMetricsBar';
import { BulkDefaultControl } from '../metrics/BulkDefaultControl';

interface ReportReviewProps {
  template: Template;
  answers: Record<string, string[]>;
  metadata: Record<string, string>;
  observations: string;
  signature: string;
  confirmedAt: string;
  onBack: () => void;
  onAnswersChange?: (answers: Record<string, string[]>) => void;
}

export function ReportReview({
  template,
  answers,
  metadata,
  observations,
  signature: initialSignature,
  confirmedAt: initialConfirmedAt,
  onBack,
  onAnswersChange,
}: ReportReviewProps) {
  const [editableAnswers, setEditableAnswers] = useState(answers);
  const [signature, setSignature] = useState(initialSignature);
  const [confirmed, setConfirmed] = useState(!!initialConfirmedAt);
  const [confirmedAt, setConfirmedAt] = useState(initialConfirmedAt);
  const [generating, setGenerating] = useState(false);

  const setItemAnswer = (itemId: string, value: string[]) => {
    const next = { ...editableAnswers, [itemId]: value };
    setEditableAnswers(next);
    onAnswersChange?.(next);
  };

  const toggleOption = (item: Item, option: string) => {
    const current = editableAnswers[item.id] || [];
    if (item.selection === 'single') {
      setItemAnswer(item.id, current.includes(option) ? [] : [option]);
    } else {
      setItemAnswer(
        item.id,
        current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option]
      );
    }
  };

  const handleApplyDefault = (option: string) => {
    if (!option) return;
    const next = applyDefaultAnswer(template.items, editableAnswers, option);
    setEditableAnswers(next);
    onAnswersChange?.(next);
  };

  const handleConfirm = () => {
    if (!signature) return;
    setConfirmedAt(new Date().toISOString());
    setConfirmed(true);
  };

  const handleDownload = async () => {
    if (!confirmed) return;
    setGenerating(true);
    try {
      await generatePdf(template, editableAnswers, metadata, observations, signature, confirmedAt);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <button className="secondary" onClick={onBack}>
          ← Voltar
        </button>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
        Revisar e assinar
      </h2>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <AnswerMetricsBar items={template.items} answers={editableAnswers} />
      </div>

      <BulkDefaultControl
        items={template.items}
        onApply={handleApplyDefault}
      />

      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Identificação</h3>
        {Object.entries(metadata).map(([key, value]) => (
          <p key={key}>
            <strong>{key}:</strong> {value}
          </p>
        ))}
      </div>

      {template.items.map((item, index) => {
        const current = editableAnswers[item.id] || [];
        const missingRequired = item.required && current.length === 0;
        return (
          <div
            key={item.id}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              border: `1px solid ${missingRequired ? COLORS.orange : COLORS.line}`,
            }}
          >
            <p style={{ fontWeight: 600 }}>
              {index + 1}. {item.title}
              {item.required && <span style={{ color: COLORS.orange }}> *</span>}
            </p>
            {item.answerType === 'text' ? (
              <input
                value={current[0] || ''}
                onChange={(e) => setItemAnswer(item.id, [e.target.value])}
                placeholder="Digite a resposta"
                style={{ marginTop: 8 }}
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {item.options.map((option) => {
                  const isSelected = current.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleOption(item, option)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? COLORS.green : COLORS.line}`,
                        background: isSelected ? COLORS.mint : 'white',
                        color: isSelected ? COLORS.green : COLORS.ink,
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
            {missingRequired && (
              <p style={{ marginTop: 8, fontSize: 13, color: COLORS.orange }}>
                Pergunta obrigatória sem resposta.
              </p>
            )}
          </div>
        );
      })}

      {observations && (
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <p style={{ fontWeight: 600 }}>Observações</p>
          <p style={{ marginTop: 8 }}>{observations}</p>
        </div>
      )}

      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
          border: `1px solid ${COLORS.line}`,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Assinatura</h3>
        <input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Nome completo"
          disabled={confirmed}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              if (!e.target.checked) {
                setConfirmed(false);
                setConfirmedAt('');
              }
            }}
          />
          Confirmo que as informações são verdadeiras.
        </label>
        {!confirmed && (
          <button
            className="primary"
            onClick={handleConfirm}
            disabled={!signature}
            style={{ marginTop: 16 }}
          >
            Confirmar e finalizar
          </button>
        )}
      </div>

      {confirmed && (
        <button
          className="primary"
          onClick={handleDownload}
          disabled={generating}
          style={{ marginTop: 24, width: '100%' }}
        >
          {generating ? 'Gerando PDF...' : 'Baixar relatório em PDF'}
        </button>
      )}
    </div>
  );
}
