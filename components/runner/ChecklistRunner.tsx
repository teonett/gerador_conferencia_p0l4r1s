import { useEffect, useState } from 'react';
import type { Template, Item } from '../../domain/checklist';
import type { HeaderModel } from '../../domain/header';
import { buildInitialAnswers } from '../../domain/checklist';
import { PHOTO, OBSERVATION } from '../../domain/constants';
import { applyDefaultAnswer } from '../../domain/metrics';
import { AnswerMetricsBar } from '../metrics/AnswerMetricsBar';
import { BulkDefaultControl } from '../metrics/BulkDefaultControl';
import { CameraCapture } from '../camera/CameraCapture';
import { PageHero } from '../layout/PageHero';
import { normalizeImage } from '../../lib/images';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD,
  FIELD_LABEL,
  HEADER_DATE_INPUT,
  HEADER_DATETIME,
  HEADER_GRID,
  HEADER_TIME_INPUT,
  INPUT,
} from '../ui/classes';

interface ChecklistRunnerProps {
  template: Template;
  header?: HeaderModel;
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
  header,
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
  const [showIdentification, setShowIdentification] = useState(!!header);

  useEffect(() => {
    setShowIdentification(!!header);
    if (!header) return;
    setMetadata((prev) => {
      if (prev.data && prev.hora) return prev;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return {
        ...prev,
        data: prev.data || now.toISOString().slice(0, 10),
        hora: prev.hora || hhmm,
      };
    });
  }, [header]);

  const currentItem: Item | null = template.items[currentIndex] || null;
  const isLast = currentIndex === template.items.length - 1;

  const handleAnswer = (itemId: string, value: string[]) => {
    setAnswers({ ...answers, [itemId]: value });
    setValidationError('');
  };

  const handleAddPhoto = async (itemId: string, file: File) => {
    const current = photos[itemId] || [];
    if (current.length >= PHOTO.maxPerQuestion) return;
    const blob = await normalizeImage(file);
    const normalized = new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, '') || 'foto'}.jpg`,
      { type: 'image/jpeg' },
    );
    setPhotos({ ...photos, [itemId]: [...current, normalized] });
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
    } else if (header) {
      setShowIdentification(true);
    }
  };

  const currentPhotos = currentItem ? (photos[currentItem.id] || []) : [];
  const inIdentification = !!header && showIdentification;

  return (
    <div>
      <PageHero title={template.title} description={template.description} />

      <div className="flex justify-between items-center mb-4">
        <button className={BTN_SECONDARY} onClick={onBack}>
          ← Voltar
        </button>
        <span className="text-gray-600 text-sm">
          {inIdentification
            ? 'Identificação'
            : `Etapa ${currentIndex + 1} de ${template.items.length}`}
        </span>
      </div>

      {!inIdentification && (
        <div className="mb-6">
          <AnswerMetricsBar items={template.items} answers={answers} />
        </div>
      )}

      {!inIdentification && (
        <BulkDefaultControl
          items={template.items}
          onApply={(option) => {
            setAnswers(applyDefaultAnswer(template.items, answers, option));
            setValidationError('');
          }}
        />
      )}

      {inIdentification && (
        <div className={`${CARD} p-6 border border-line`}>
          <h3 className="text-base font-semibold mb-3">Identificação</h3>
          <div className={HEADER_DATETIME}>
            <div>
              <label className={FIELD_LABEL}>Data</label>
              <input
                type="date"
                value={metadata['data'] || ''}
                onChange={(e) => setMetadata({ ...metadata, data: e.target.value })}
                className={`${INPUT} ${HEADER_DATE_INPUT}`}
              />
            </div>
            <div>
              <label className={FIELD_LABEL}>Hora</label>
              <input
                type="time"
                value={metadata['hora'] || ''}
                onChange={(e) => setMetadata({ ...metadata, hora: e.target.value })}
                className={`${INPUT} ${HEADER_TIME_INPUT}`}
              />
            </div>
          </div>
          <div className={HEADER_GRID}>
            {header?.fields.map((field) => (
              <div key={field.id}>
                <label className={FIELD_LABEL}>{field.label}</label>
                <input
                  value={metadata[field.id] || ''}
                  onChange={(e) => setMetadata({ ...metadata, [field.id]: e.target.value })}
                  className={INPUT}
                />
              </div>
            ))}
          </div>
          <button className={`${BTN_PRIMARY} mt-5`} onClick={() => setShowIdentification(false)}>
            Iniciar perguntas →
          </button>
        </div>
      )}

      {!header && template.fields && (
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-3">Identificação</h3>
          {template.fields.map((field) => (
            <div key={field.id} className="mb-3">
              <label className={FIELD_LABEL}>
                {field.label}
                {field.required && <span className="text-orange">*</span>}
              </label>
              <input
                type={field.type}
                value={metadata[field.id] || ''}
                onChange={(e) => setMetadata({ ...metadata, [field.id]: e.target.value })}
                required={field.required}
                className={INPUT}
              />
            </div>
          ))}
        </div>
      )}

      {!inIdentification && currentItem && (
        <div className={`${CARD} p-6 border border-line`}>
          <h3 className="text-base font-semibold mb-4">
            {currentIndex + 1}. {currentItem.title}
            {currentItem.required && <span className="text-orange"> *</span>}
          </h3>

          {currentItem.answerType === 'text' ? (
            <input
              value={answers[currentItem.id]?.[0] || ''}
              onChange={(e) => handleAnswer(currentItem.id, [e.target.value])}
              placeholder="Digite sua resposta"
              className={INPUT}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
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
                    className={`px-4 py-2 rounded-lg border ${
                      isSelected
                        ? 'border-corPadrao bg-mint text-corPadrao'
                        : 'border-line bg-surface text-ink'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5">
            <label className={FIELD_LABEL}>
              Observações{isLast && <span className="text-orange"> (mínimo {OBSERVATION.minLength} caracteres)</span>}
            </label>
            <textarea
              value={observations}
              onChange={(e) => { setObservations(e.target.value); setValidationError(''); }}
              placeholder="Observações adicionais"
              rows={2}
              className={INPUT}
            />
          </div>

          <div className="mt-4">
            <label className={FIELD_LABEL}>
              Fotos (opcional, máx. {PHOTO.maxPerQuestion})
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentPhotos.map((file, pi) => (
                <div
                  key={pi}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-line"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Foto ${pi + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(currentItem.id, pi)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 text-xs cursor-pointer flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {currentPhotos.length < PHOTO.maxPerQuestion && (
              <div className="flex gap-2">
                <button
                  className={`${BTN_SECONDARY} px-4 py-2 text-[13px] border-dashed`}
                  onClick={() => setCameraOpen(true)}
                >
                  📷 Tirar foto
                </button>
                <label
                  className="inline-block px-4 py-2 rounded-lg border border-dashed border-line cursor-pointer text-[13px] text-gray-600"
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
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {!inIdentification && validationError && (
        <p className="text-orange mt-3 text-sm">{validationError}</p>
      )}

      {!inIdentification && (
        <div className="flex justify-between mt-6">
          <button
            className={BTN_SECONDARY}
            onClick={handlePrev}
            disabled={currentIndex === 0 && !header}
          >
            Anterior
          </button>
          <button className={BTN_PRIMARY} onClick={handleNext}>
            {isLast ? 'Revisar e assinar' : 'Próximo'}
          </button>
        </div>
      )}

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
