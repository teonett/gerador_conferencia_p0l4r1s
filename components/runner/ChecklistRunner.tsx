import { useState } from 'react';
import type { Template, Item } from '../../domain/checklist';
import { buildInitialAnswers } from '../../domain/checklist';
import { COLORS, PHOTO, OBSERVATION } from '../../domain/constants';
import { applyDefaultAnswer } from '../../domain/metrics';
import { AnswerMetricsBar } from '../metrics/AnswerMetricsBar';
import { BulkDefaultControl } from '../metrics/BulkDefaultControl';
import { CameraCapture } from '../camera/CameraCapture';

interface ChecklistRunnerProps {
  template: Template;
  initialAnswers?: Record<string, string[]>;
  initialMetadata?: Record<string, string>;
  initialObservations?: string;
  initialPhotos?: Record<string, File[]>;
  onFinish: (data: {
    answers: Record<string, string[]>;
    metadata: Record<string, string>;
    observations: string;
    photos: Record<string, File[]>;
    signature: string;
    confirmedAt: string;
  }) => void;
  onBack: () => void;
}

export function ChecklistRunner({
  template,
  initialAnswers,
  initialMetadata,
  initialObservations,
  initialPhotos,
  onFinish,
  onBack,
}: ChecklistRunnerProps) {
  const [answers, setAnswers] = useState(
    () => initialAnswers || buildInitialAnswers(template.items)
  );
  const [metadata, setMetadata] = useState<Record<string, string>>(initialMetadata || {});
  const [observations, setObservations] = useState(initialObservations || '');
  const [photos, setPhotos] = useState<Record<string, File[]>>(initialPhotos || {});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const currentItem: Item | null = template.items[currentIndex] || null;
  const isLast = currentIndex === template.items.length - 1;

  const handleAnswer = (itemId: string, value: string[]) => {
    setAnswers({ ...answers, [itemId]: value });
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
        photos,
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
        <AnswerMetricsBar items={template.items} answers={answers} />
      </div>

      <BulkDefaultControl
        items={template.items}
        onApply={(option) => {
          setAnswers(applyDefaultAnswer(template.items, answers, option));
          setValidationError('');
        }}
      />

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
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="secondary"
                  onClick={() => setCameraOpen(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    border: `1px dashed ${COLORS.line}`,
                  }}
                >
                  📷 Tirar foto
                </button>
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
                  + Galeria
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAddPhoto(currentItem.id, file);
                      e.target.value = '';
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
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

      {cameraOpen && currentItem && (
        <CameraCapture
          onCapture={(file) => {
            handleAddPhoto(currentItem.id, file);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
