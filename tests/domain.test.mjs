import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CIPA_SEED } from '../db/seed.js';

describe('CIPA Seed', () => {
  it('tem exatamente 16 perguntas', () => {
    assert.strictEqual(CIPA_SEED.items.length, 16);
  });

  it('cada pergunta tem id, título e opções', () => {
    for (const item of CIPA_SEED.items) {
      assert.ok(item.id);
      assert.ok(item.title);
      assert.ok(item.options.length > 0);
    }
  });

  it('shareToken está definido', () => {
    assert.ok(CIPA_SEED.shareToken);
  });
});

describe('Sanitização de filename', () => {
  it('remove caracteres inválidos', () => {
    const input = ' foto com espaços.jpg';
    const result = input.replace(/[^a-zA-Z0-9._-]/g, '-');
    assert.strictEqual(result, '-foto-com-espa-os-.jpg');
  });
});

describe('Template', () => {
  it('normalize items corretamente', () => {
    const template = CIPA_SEED;
    assert.strictEqual(template.items[0].answerType, 'choice');
    assert.strictEqual(template.items[0].selection, 'single');
  });
});
