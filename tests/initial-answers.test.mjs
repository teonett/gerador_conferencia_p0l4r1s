import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildInitialAnswers } from '../domain/checklist.js';

function choiceItem(id, options, defaultOption) {
  return {
    id,
    title: `Pergunta ${id}`,
    required: false,
    options,
    answerType: 'choice',
    selection: 'single',
    ...(defaultOption ? { defaultOption } : {}),
  };
}

describe('buildInitialAnswers', () => {
  const items = [
    choiceItem('q1', ['Sim', 'Não', 'Outros'], 'Sim'),
    choiceItem('q2', ['Sim', 'Não', 'Não aplicável']),
    choiceItem('q3', ['Sim', 'Não', 'Em partes'], 'Em partes'),
    { id: 'q4', title: 'Texto', required: false, options: [], answerType: 'text', selection: 'single' },
  ];

  it('retorna vazio quando nenhum item tem padrão', () => {
    assert.deepStrictEqual(buildInitialAnswers([items[1], items[3]]), {});
  });

  it('pré-preenche as respostas configuradas como padrão', () => {
    assert.deepStrictEqual(buildInitialAnswers(items), {
      q1: ['Sim'],
      q3: ['Em partes'],
    });
  });

  it('ignora padrão que não existe mais nas opções do item', () => {
    const invalid = [choiceItem('q1', ['Sim', 'Não', 'Outros'], 'Talvez')];
    assert.deepStrictEqual(buildInitialAnswers(invalid), {});
  });

  it('ignora perguntas de texto livre com padrão', () => {
    const textWithDefault = [
      { id: 'q5', title: 'Texto', required: false, options: ['Sim'], answerType: 'text', selection: 'single', defaultOption: 'Sim' },
    ];
    assert.deepStrictEqual(buildInitialAnswers(textWithDefault), {});
  });
});
