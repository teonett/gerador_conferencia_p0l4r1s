import { useState } from 'react';
import type { Template } from '../../domain/checklist';
import { COLORS } from '../../domain/constants';
import { generatePdf } from '../../lib/pdf';

interface ReportReviewProps {
  template: Template;
  answers: Record<string, string[]>;
  metadata: Record<string, string>;
  observations: string;
  signature: string;
  confirmedAt: string;
  onBack: () => void;
}

export function ReportReview({
  template,
  answers,
  metadata,
  observations,
  signature: initialSignature,
  confirmedAt: initialConfirmedAt,
  onBack,
}: ReportReviewProps) {
  const [signature, setSignature] = useState(initialSignature);
  const [confirmed, setConfirmed] = useState(!!initialConfirmedAt);
  const [confirmedAt, setConfirmedAt] = useState(initialConfirmedAt);
  const [generating, setGenerating] = useState(false);

  const handleConfirm = () => {
    if (!signature) return;
    setConfirmedAt(new Date().toISOString());
    setConfirmed(true);
  };

  const handleDownload = async () => {
    if (!confirmed) return;
    setGenerating(true);
    try {
      await generatePdf(template, answers, metadata, observations, signature, confirmedAt);
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
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Identificação</h3>
        {Object.entries(metadata).map(([key, value]) => (
          <p key={key}>
            <strong>{key}:</strong> {value}
          </p>
        ))}
      </div>

      {template.items.map((item, index) => (
        <div
          key={item.id}
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <p style={{ fontWeight: 600 }}>
            {index + 1}. {item.title}
          </p>
          <p style={{ marginTop: 8, color: COLORS.green }}>
            Resposta: {answers[item.id]?.join(', ') || '—'}
          </p>
        </div>
      ))}

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
