import { useState, useRef } from 'react';
import type { Template, Item } from '../../domain/checklist';
import { COLORS, OPTION } from '../../domain/constants';

interface TemplateEditorProps {
  onSave: (template: Template) => void;
  onCancel: () => void;
  initial?: Template;
}

function ensureOutros(options: string[]): string[] {
  const filtered = options.filter((o) => o !== OPTION.outrosLabel);
  return [...filtered, OPTION.outrosLabel];
}

function makeBlankItem(): Item {
  return {
    id: crypto.randomUUID(),
    title: '',
    required: true,
    answerType: 'choice',
    selection: 'single',
    options: ['Sim', 'Não', OPTION.outrosLabel],
  };
}

export function TemplateEditor({ onSave, onCancel, initial }: TemplateEditorProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || 'Segurança');
  const [items, setItems] = useState<Item[]>(
    initial?.items.map((it) => ({
      ...it,
      options: ensureOutros(it.options),
    })) || []
  );
  const [newItemTitle, setNewItemTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    setItems([
      ...items,
      {
        ...makeBlankItem(),
        title: newItemTitle.trim(),
      },
    ]);
    setNewItemTitle('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    if (editingItemId === id) setEditingItemId(null);
  };

  const handleUpdateItemTitle = (id: string, title: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, title } : it)));
  };

  const handleUpdateOption = (itemId: string, optIndex: number, value: string) => {
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        const opts = [...it.options];
        opts[optIndex] = value;
        return { ...it, options: opts };
      })
    );
  };

  const handleAddOption = (itemId: string) => {
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        if (it.options.length >= OPTION.max) return it;
        const opts = [...it.options];
        opts.splice(opts.length - 1, 0, '');
        return { ...it, options: opts };
      })
    );
  };

  const handleRemoveOption = (itemId: string, optIndex: number) => {
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        const opt = it.options[optIndex];
        if (opt === OPTION.outrosLabel) return it;
        if (it.options.length <= OPTION.min) return it;
        const opts = it.options.filter((_, i) => i !== optIndex);
        return { ...it, options: ensureOutros(opts) };
      })
    );
  };

  const handleImportTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.replace(/^\d+[.)]\s*/, '').trim())
        .filter((l) => l.length > 0);

      const imported: Item[] = lines.map((line) => ({
        ...makeBlankItem(),
        title: line,
      }));

      setItems((prev) => [...prev, ...imported]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Digite o nome do modelo.');
      return;
    }
    if (items.length === 0) {
      setError('Adicione pelo menos uma pergunta.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].title.trim()) {
        setError(`Pergunta ${i + 1} está sem título.`);
        return;
      }
      const nonOutros = items[i].options.filter((o) => o !== OPTION.outrosLabel);
      if (nonOutros.length + 1 < OPTION.min) {
        setError(`Pergunta "${items[i].title}" precisa de pelo menos ${OPTION.min} opções (incluindo "Outros").`);
        return;
      }
      if (items[i].options.length > OPTION.max) {
        setError(`Pergunta "${items[i].title}" pode ter no máximo ${OPTION.max} opções.`);
        return;
      }
      const last = items[i].options[items[i].options.length - 1];
      if (last !== OPTION.outrosLabel) {
        setError(`Pergunta "${items[i].title}": "Outros" deve ser a última opção.`);
        return;
      }
    }

    setError('');
    setSaving(true);

    try {
      const template: Template = {
        id: initial?.id || crypto.randomUUID(),
        title: title.trim(),
        description,
        category,
        items: items.map((it) => ({
          ...it,
          options: ensureOutros(it.options),
        })),
        shareToken: initial?.shareToken || crypto.randomUUID().slice(0, 8),
      };

      const method = initial ? 'PUT' : 'POST';
      const url = initial ? `/api/checklists/${initial.id}` : '/api/checklists';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erro ${res.status}`);
      }

      onSave(template);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar modelo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
        {initial ? 'Editar modelo' : 'Novo modelo'}
      </h2>

      <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do modelo"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Segurança</option>
          <option>Operação</option>
          <option>Manutenção</option>
          <option>CIPA · Segurança do Trabalho</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Perguntas ({items.length})</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="secondary"
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: 12 }}
          >
            Importar TXT/CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleImportTxt}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {items.map((item, index) => {
        const isEditing = editingItemId === item.id;
        return (
          <div
            key={item.id}
            style={{
              background: 'white',
              borderRadius: 8,
              marginBottom: 8,
              border: `1px solid ${isEditing ? COLORS.green : COLORS.line}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 12px',
              }}
            >
              <span style={{ color: '#666', minWidth: 24 }}>{index + 1}.</span>
              {isEditing ? (
                <input
                  value={item.title}
                  onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                  style={{ flex: 1, fontWeight: 600 }}
                  autoFocus
                />
              ) : (
                <span
                  style={{ flex: 1, fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setEditingItemId(item.id)}
                >
                  {item.title || '(sem título)'}
                </span>
              )}
              <button
                className="secondary"
                onClick={() => setEditingItemId(isEditing ? null : item.id)}
                style={{ fontSize: 12 }}
              >
                {isEditing ? 'Fechar' : 'Editar'}
              </button>
              <button
                className="secondary"
                onClick={() => handleRemoveItem(item.id)}
                style={{ fontSize: 12, color: COLORS.orange }}
              >
                Remover
              </button>
            </div>

            {isEditing && (
              <div style={{ padding: '0 12px 12px' }}>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                  Opções ({item.options.length}/{OPTION.max}) — "Outros" é obrigatório e sempre o último:
                </p>
                {item.options.map((opt, oi) => {
                  const isOutros = opt === OPTION.outrosLabel;
                  return (
                    <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                      <span style={{ color: '#999', fontSize: 12, minWidth: 18 }}>{oi + 1}.</span>
                      <input
                        value={opt}
                        onChange={(e) => handleUpdateOption(item.id, oi, e.target.value)}
                        disabled={isOutros}
                        style={{ flex: 1, fontSize: 13 }}
                      />
                      {!isOutros && item.options.length > OPTION.min && (
                        <button
                          className="secondary"
                          onClick={() => handleRemoveOption(item.id, oi)}
                          style={{ fontSize: 11, padding: '4px 8px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
                {item.options.length < OPTION.max && (
                  <button
                    className="secondary"
                    onClick={() => handleAddOption(item.id)}
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    + Adicionar opção
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Nova pergunta"
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
        />
        <button className="primary" onClick={handleAddItem}>
          Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button className="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar modelo'}
        </button>
      </div>
      {error && (
        <p style={{ color: COLORS.orange, marginTop: 12, fontSize: 14 }}>{error}</p>
      )}
    </div>
  );
}
