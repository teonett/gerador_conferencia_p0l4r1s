import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  applyDefaultAnswer,
  classifyAnswer,
  collectChoiceOptions,
  computeAnswerMetrics,
} from '../domain/metrics.js';

function choiceItem(id, options, selection = 'single') {
  return { id, title: `Pergunta ${id}`, required: false, options, answerType: 'choice', selection };
}

describe('classifyAnswer', () => {
  it('classifica Sim como yes', () => {
    assert.strictEqual(classifyAnswer('Sim'), 'yes');
    assert.strictEqual(classifyAnswer(' sim '), 'yes');
    assert.strictEqual(classifyAnswer('SIM'), 'yes');
  });

  it('classifica Não como no', () => {
    assert.strictEqual(classifyAnswer('Não'), 'no');
    assert.strictEqual(classifyAnswer('nao'), 'no');
  });

  it('classifica Não aplicável como other (não confunde com Não)', () => {
    assert.strictEqual(classifyAnswer('Não aplicável'), 'other');
  });

  it('classifica demais respostas como other', () => {
    assert.strictEqual(classifyAnswer('Em partes'), 'other');
    assert.strictEqual(classifyAnswer('Outros'), 'other');
  });
});

describe('computeAnswerMetrics', () => {
  const items = [
    choiceItem('q1', ['Sim', 'Não', 'Outros']),
    choiceItem('q2', ['Sim', 'Não', 'Não aplicável']),
    choiceItem('q3', ['Sim', 'Não', 'Em partes'], 'multiple'),
  ];

  it('retorna tudo pendente sem respostas', () => {
    const metrics = computeAnswerMetrics(items, {});
    assert.strictEqual(metrics.total, 3);
    assert.strictEqual(metrics.answered, 0);
    assert.strictEqual(metrics.pending, 3);
    assert.strictEqual(metrics.yes, 0);
    assert.strictEqual(metrics.no, 0);
    assert.strictEqual(metrics.other, 0);
  });

  it('conta respostas por classificação e por opção', () => {
    const answers = { q1: ['Sim'], q2: ['Não'], q3: ['Em partes', 'Sim'] };
    const metrics = computeAnswerMetrics(items, answers);
    assert.strictEqual(metrics.answered, 3);
    assert.strictEqual(metrics.pending, 0);
    assert.strictEqual(metrics.yes, 2);
    assert.strictEqual(metrics.no, 1);
    assert.strictEqual(metrics.other, 1);
    assert.deepStrictEqual(metrics.byOption, { Sim: 2, Não: 1, 'Em partes': 1 });
  });
});

describe('applyDefaultAnswer', () => {
  const items = [
    choiceItem('q1', ['Sim', 'Não', 'Outros']),
    choiceItem('q2', ['Sim', 'Não', 'Não aplicável']),
    choiceItem('q3', ['Sim', 'Não', 'Em partes'], 'multiple'),
    { id: 'q4', title: 'Texto', required: false, options: [], answerType: 'text', selection: 'single' },
  ];

  it('aplica o default em todas as perguntas de escolha que possuem a opção', () => {
    const result = applyDefaultAnswer(items, {}, 'Sim');
    assert.deepStrictEqual(result.q1, ['Sim']);
    assert.deepStrictEqual(result.q2, ['Sim']);
    assert.deepStrictEqual(result.q3, ['Sim']);
  });

  it('altera respostas existentes ao reaplicar outro default', () => {
    const first = applyDefaultAnswer(items, {}, 'Sim');
    const second = applyDefaultAnswer(items, first, 'Não');
    assert.deepStrictEqual(second.q1, ['Não']);
    assert.deepStrictEqual(second.q2, ['Não']);
    assert.deepStrictEqual(second.q3, ['Não']);
  });

  it('não duplica opção em perguntas de seleção múltipla', () => {
    const once = applyDefaultAnswer(items, {}, 'Sim');
    const twice = applyDefaultAnswer(items, once, 'Sim');
    assert.deepStrictEqual(twice.q3, ['Sim']);
  });

  it('ignora itens sem a opção e perguntas de texto livre', () => {
    const result = applyDefaultAnswer(items, {}, 'Não aplicável');
    assert.strictEqual(result.q1, undefined);
    assert.deepStrictEqual(result.q2, ['Não aplicável']);
    assert.strictEqual(result.q4, undefined);
  });

  it('preserva respostas não relacionadas', () => {
    const existing = { q4: ['texto livre'] };
    const result = applyDefaultAnswer(items, existing, 'Sim');
    assert.deepStrictEqual(result.q4, ['texto livre']);
  });
});

describe('collectChoiceOptions', () => {
  it('une opções de todas as perguntas de escolha sem duplicar', () => {
    const items = [
      choiceItem('q1', ['Sim', 'Não', 'Outros']),
      choiceItem('q2', ['Sim', 'Não aplicável']),
      { id: 'q3', title: 'Texto', required: false, options: [], answerType: 'text', selection: 'single' },
    ];
    assert.deepStrictEqual(collectChoiceOptions(items), ['Sim', 'Não', 'Outros', 'Não aplicável']);
  });
});
