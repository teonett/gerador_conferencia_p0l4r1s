import { useMemo, useState } from 'react';
import type { Template, Item } from '../../domain/checklist';
import { COLORS, METRIC_COLORS, PHOTO, OBSERVATION } from '../../domain/constants';
import {
  applyDefaultAnswer,
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

interface ChecklistRunnerProps {
  template: Template;
  onFinish: (data: {
    answers: Record<string, string[]>;
    metadata: Record<string, string>;
    observations: string;
    signature: string;
    confirmedAt: string;
  }) => void;
  onBack: () => void;
}

export function ChecklistRunner({ template, onFinish, onBack }: ChecklistRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState('');
  const [photos, setPhotos] = useState<Record<string, File[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [defaultOption, setDefaultOption] = useState('');

  const currentItem: Item | null = template.items[currentIndex] || null;
  const isLast = currentIndex === template.items.length - 1;
  const metrics = useMemo(
    () => computeAnswerMetrics(template.items, answers),
    [template.items, answers]
  );
  const bulkOptions = useMemo(() => collectChoiceOptions(template.items), [template.items]);

  const handleAnswer = (itemId: string, value: string[]) => {
    setAnswers({ ...answers, [itemId]: value });
    setValidationError('');
  };

  const handleApplyDefault = () => {
    if (!defaultOption) return;
    setAnswers(applyDefaultAnswer(template.items, answers, defaultOption));
    setValidationError('');
  };

  const handleAddPhoto = (itemId: string, file: File) => {
    const current = photos[itemId] || [];
    if (current.length >= PHOTO.maxPerQuestion) return;
    setPhotos({ ...photos, [itemId]: [...current, file] });
  };

  const handleRemovePhoto = (itemId: string, index: number) => {
    const current = photos[itemId] || [];
    setPhotos({ ...photos, [itemId]: current.filter((_, i) => i !== index) });
  };

  const validateCurrent = (): boolean => {
    if (!currentItem) return true;

    if (currentItem.required && (!answers[currentItem.id] || answers[currentItem.id].length === 0)) {
      setValidationError('Esta pergunta é obrigatória.');
      return false;
    }

    if (isLast && observations.trim().length > 0 && observations.trim().length < OBSERVATION.minLength) {
      setValidationError(`Observações devem ter pelo menos ${OBSERVATION.minLength} caracteres ou ficar vazias.`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrent()) return;

    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
      setValidationError('');
    } else {
      onFinish({
        answers,
        metadata,
        observations,
        signature: '',
        confirmedAt: '',
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setValidationError('');
    }
  };

  const currentPhotos = currentItem ? (photos[currentItem.id] || []) : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="secondary" onClick={onBack}>
          ← Voltar
        </button>
        <span style={{ color: '#666', fontSize: 14 }}>
          Etapa {currentIndex + 1} de {template.items.length}
        </span>
      </div>

      <div style={{ marginBottom: 24 }}>
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
          <span>
            {metrics.total > 0 ? Math.round((metrics.answered / metrics.total) * 100) : 0}%
          </span>
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
          {bulkOptions.map((option) => (
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

      {bulkOptions.length > 0 && (
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
            {bulkOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            className="secondary"
            onClick={handleApplyDefault}
            disabled={!defaultOption}
            style={{
              opacity: defaultOption ? 1 : 0.5,
              cursor: defaultOption ? 'pointer' : 'not-allowed',
            }}
          >
            Aplicar a todas as perguntas
          </button>
        </div>
      )}

      {template.fields && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Identificação</h3>
          {template.fields.map((field) => (
            <div key={field.id} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
                {field.label}
                {field.required && <span style={{ color: COLORS.orange }}>*</span>}
              </label>
              <input
                type={field.type}
                value={metadata[field.id] || ''}
                onChange={(e) => setMetadata({ ...metadata, [field.id]: e.target.value })}
                required={field.required}
              />
            </div>
          ))}
        </div>
      )}

      {currentItem && (
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            {currentIndex + 1}. {currentItem.title}
            {currentItem.required && <span style={{ color: COLORS.orange }}> *</span>}
          </h3>

          {currentItem.answerType === 'text' ? (
            <input
              value={answers[currentItem.id]?.[0] || ''}
              onChange={(e) => handleAnswer(currentItem.id, [e.target.value])}
              placeholder="Digite sua resposta"
            />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {currentItem.options.map((option) => {
                const isSelected = answers[currentItem.id]?.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => {
                      if (currentItem.selection === 'single') {
                        handleAnswer(currentItem.id, isSelected ? [] : [option]);
                      } else {
                        const current = answers[currentItem.id] || [];
                        handleAnswer(
                          currentItem.id,
                          isSelected ? current.filter((o) => o !== option) : [...current, option]
                        );
                      }
                    }}
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

          <div style={{ marginTop: 20 }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
              Observações{isLast && <span style={{ color: COLORS.orange }}> (mínimo {OBSERVATION.minLength} caracteres)</span>}
            </label>
            <textarea
              value={observations}
              onChange={(e) => { setObservations(e.target.value); setValidationError(''); }}
              placeholder="Observações adicionais"
              rows={2}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
              Fotos (opcional, máx. {PHOTO.maxPerQuestion})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {currentPhotos.map((file, pi) => (
                <div
                  key={pi}
                  style={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: `1px solid ${COLORS.line}`,
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Foto ${pi + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => handleRemovePhoto(currentItem.id, pi)}
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {currentPhotos.length < PHOTO.maxPerQuestion && (
              <label
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px dashed ${COLORS.line}`,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#666',
                }}
              >
                + Adicionar foto
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAddPhoto(currentItem.id, file);
                    e.target.value = '';
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {validationError && (
        <p style={{ color: COLORS.orange, marginTop: 12, fontSize: 14 }}>{validationError}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button className="secondary" onClick={handlePrev} disabled={currentIndex === 0}>
          Anterior
        </button>
        <button className="primary" onClick={handleNext}>
          {isLast ? 'Revisar e assinar' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}
