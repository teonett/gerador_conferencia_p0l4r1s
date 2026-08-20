'use client';

import { useState } from 'react';
import type { Template, Item } from '../../domain/checklist';
import { COLORS } from '../../domain/constants';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem: Item | null = template.items[currentIndex] || null;
  const progress = Math.round((currentIndex / template.items.length) * 100);

  const handleAnswer = (itemId: string, value: string[]) => {
    setAnswers({ ...answers, [itemId]: value });
  };

  const handleNext = () => {
    if (currentItem && currentItem.required && (!answers[currentItem.id] || answers[currentItem.id].length === 0)) {
      return;
    }
    if (currentIndex < template.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <button className="secondary" onClick={onBack}>
          ← Voltar
        </button>
        <span style={{ color: '#666' }}>{progress}%</span>
      </div>

      <div
        style={{
          height: 4,
          background: COLORS.line,
          borderRadius: 2,
          marginBottom: 32,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: COLORS.green,
            transition: 'width 0.3s',
          }}
        />
      </div>

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

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
              Observações
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações adicionais"
              rows={2}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <input type="file" accept="image/*" capture="environment" />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button className="secondary" onClick={handlePrev} disabled={currentIndex === 0}>
          Anterior
        </button>
        <button className="primary" onClick={handleNext}>
          {currentIndex === template.items.length - 1 ? 'Revisar e assinar' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}
