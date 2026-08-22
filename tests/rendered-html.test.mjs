import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { CIPA_SEED } from '../db/seed.js';
import { ChecklistRunner } from '../components/runner/ChecklistRunner.tsx';
import { ReportReview } from '../components/report/ReportReview.tsx';
import { ResponseHistory } from '../components/history/ResponseHistory.tsx';

describe('Renderização de telas (SSR)', () => {
  it('ChecklistRunner renderiza a primeira etapa sem erro', () => {
    const html = renderToString(
      createElement(ChecklistRunner, {
        template: CIPA_SEED,
        initialAnswers: {},
        initialMetadata: {},
        initialObservations: '',
        initialPhotos: {},
        onFinish: () => {},
        onBack: () => {},
      })
    );
    const text = html.replace(/<!-- -->/g, '');
    assert.ok(text.includes('Etapa 1 de 16'), 'deve exibir etapa inicial');
    assert.ok(text.includes('CIPA - Áreas Administrativas') === false);
  });

  it('ReportReview somente leitura renderiza respostas', () => {
    const html = renderToString(
      createElement(ReportReview, {
        template: CIPA_SEED,
        answers: { 'cipa-1': ['Sim'] },
        metadata: { setor: 'Administração' },
        observations: '',
        photos: {},
        signature: '',
        confirmedAt: '',
        onBack: () => {},
      })
    );
    const text = html.replace(/<!-- -->/g, '');
    assert.ok(text.includes('Revisar e assinar'));
    assert.ok(text.includes('Resposta: Sim'));
  });

  it('ResponseHistory renderiza estado vazio', () => {
    const html = renderToString(createElement(ResponseHistory));
    assert.ok(typeof html === 'string');
  });
});
