import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  itemSchema,
  templateSchema,
  responsePayloadSchema,
} from '../domain/schema.ts';

const validItem = {
  id: 'q1',
  title: 'Kit de primeiros socorros disponível?',
  required: true,
  answerType: 'choice',
  selection: 'single',
  options: ['Sim', 'Não', 'Outros'],
  defaultOption: 'Sim',
};

const validTemplate = {
  id: 't1',
  title: 'Inspeção Teste',
  description: '',
  category: 'Segurança',
  items: [
    validItem,
    {
      id: 'q2',
      title: 'Observação livre',
      required: false,
      answerType: 'text',
      selection: 'single',
      options: [],
    },
  ],
  shareToken: 'abc123',
};

describe('domain/schema.ts (Zod v4)', () => {
  it('aceita item de escolha válido (3 opções, Outros por último)', () => {
    const res = itemSchema.safeParse(validItem);
    assert.ok(res.success, res.success ? '' : JSON.stringify(res.error.issues));
  });

  it('rejeita item com menos de 3 opções', () => {
    const res = itemSchema.safeParse({ ...validItem, options: ['Sim', 'Outros'] });
    assert.ok(!res.success);
  });

  it('rejeita item cuja última opção não é Outros', () => {
    const res = itemSchema.safeParse({
      ...validItem,
      options: ['Sim', 'Não', 'Não aplicável'],
    });
    assert.ok(!res.success);
    assert.ok(res.error.issues.some((i) => i.message.includes('Outros')));
  });

  it('rejeita item de texto livre com opções preenchidas', () => {
    const res = itemSchema.safeParse({
      id: 'x',
      title: 'Livre',
      required: false,
      answerType: 'text',
      selection: 'single',
      options: ['Sim', 'Não', 'Outros'],
    });
    assert.ok(!res.success);
  });

  it('rejeita defaultOption que não pertence às opções', () => {
    const res = itemSchema.safeParse({ ...validItem, defaultOption: 'Talvez' });
    assert.ok(!res.success);
  });

  it('aceita template válido com item de texto livre', () => {
    const res = templateSchema.safeParse(validTemplate);
    assert.ok(res.success, res.success ? '' : JSON.stringify(res.error.issues));
  });

  it('rejeita template sem perguntas', () => {
    const res = templateSchema.safeParse({ ...validTemplate, items: [] });
    assert.ok(!res.success);
  });

  it('rejeita template sem título', () => {
    const res = templateSchema.safeParse({ ...validTemplate, title: '' });
    assert.ok(!res.success);
  });

  it('rejeita seed CIPA (opções não terminam em Outros)', () => {
    const res = templateSchema.safeParse({
      ...validTemplate,
      items: [
        {
          ...validItem,
          options: ['Sim', 'Não', 'Não aplicável', 'Em partes'],
        },
      ],
    });
    assert.ok(!res.success);
  });

  it('responsePayloadSchema aceita respostas, metadata, itemObservations e extraItems', () => {
    const res = responsePayloadSchema.safeParse({
      answers: { q1: ['Sim'] },
      metadata: { setor: 'Administração' },
      itemObservations: { q1: 'Tudo ok' },
      extraItems: [validItem],
    });
    assert.ok(res.success, res.success ? '' : JSON.stringify(res.error.issues));
    assert.deepStrictEqual(res.data.extraItems, [validItem]);
    assert.deepStrictEqual(res.data.itemObservations, { q1: 'Tudo ok' });
  });
});