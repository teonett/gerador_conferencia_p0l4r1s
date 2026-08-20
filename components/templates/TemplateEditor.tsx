'use client';

import { useState } from 'react';
import type { Template, Item } from '../../domain/checklist';
import { COLORS } from '../../domain/constants';

interface TemplateEditorProps {
  onSave: (template: Template) => void;
  onCancel: () => void;
  initial?: Template;
}

export function TemplateEditor({ onSave, onCancel, initial }: TemplateEditorProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || 'Segurança');
  const [items, setItems] = useState<Item[]>(initial?.items || []);
  const [newItemTitle, setNewItemTitle] = useState('');

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        title: newItemTitle,
        required: true,
        answerType: 'choice',
        selection: 'single',
        options: ['Sim', 'Não'],
      },
    ]);
    setNewItemTitle('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (!title || items.length === 0) return;

    const template: Template = {
      id: initial?.id || crypto.randomUUID(),
      title,
      description,
      category,
      items,
      shareToken: initial?.shareToken || crypto.randomUUID().slice(0, 8),
    };

    const method = initial ? 'PUT' : 'POST';
    const url = initial ? `/api/checklists/${initial.id}` : '/api/checklists';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });

    onSave(template);
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

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Perguntas</h3>
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            background: 'white',
            borderRadius: 8,
            marginBottom: 8,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <span style={{ color: '#666' }}>{index + 1}.</span>
          <span style={{ flex: 1 }}>{item.title}</span>
          <button
            className="secondary"
            onClick={() => handleRemoveItem(item.id)}
            style={{ fontSize: 12 }}
          >
            Remover
          </button>
        </div>
      ))}

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
        <button className="primary" onClick={handleSave} disabled={!title || items.length === 0}>
          Salvar modelo
        </button>
      </div>
    </div>
  );
}
