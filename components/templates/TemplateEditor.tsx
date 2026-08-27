import { useState, useRef, useEffect } from 'react';
import type { Template, Item } from '../../domain/checklist';
import type { HeaderModel } from '../../domain/header';
import { OPTION } from '../../domain/constants';
import { MainHero } from '../main/MainHero';
import { BTN_PRIMARY, BTN_SECONDARY, BTN_SUCCESS, BTN_WARNING, INPUT } from '../ui/classes';

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
    defaultOption: 'Sim',
  };
}

function sanitizeItem(it: Item): Item {
  const options = ensureOutros(it.options);
  const validDefault =
    it.answerType === 'choice' &&
    !!it.defaultOption &&
    options.includes(it.defaultOption);
  return {
    id: it.id,
    title: it.title,
    required: it.required,
    options,
    answerType: it.answerType,
    selection: it.selection,
    ...(validDefault ? { defaultOption: it.defaultOption } : {}),
    ...(it.hint ? { hint: it.hint } : {}),
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
  const [headerId, setHeaderId] = useState(initial?.headerId || '');
  const [headers, setHeaders] = useState<HeaderModel[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/headers')
      .then((res) => res.json())
      .then((payload) => {
        const data = payload as { headers?: HeaderModel[] };
        if (data.headers) setHeaders(data.headers);
      })
      .catch(() => {});
  }, []);

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

  const handleUpdateItemHint = (id: string, hint: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, hint } : it)));
  };

  const handleToggleDefault = (itemId: string, option: string) => {
    setItems(
      items.map((it) =>
        it.id === itemId
          ? { ...it, defaultOption: it.defaultOption === option ? undefined : option }
          : it
      )
    );
  };

  const handleUpdateOption = (itemId: string, optIndex: number, value: string) => {
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        const opts = [...it.options];
        opts[optIndex] = value;
        const next = { ...it, options: opts };
        if (next.defaultOption && !opts.includes(next.defaultOption)) {
          delete next.defaultOption;
        }
        return next;
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
        const next = { ...it, options: ensureOutros(opts) };
        if (next.defaultOption && !next.options.includes(next.defaultOption)) {
          delete next.defaultOption;
        }
        return next;
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
        items: items.map(sanitizeItem),
        headerId: headerId || undefined,
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
        const data = (await res.json().catch(() => ({}))) as { error?: string };
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
      <MainHero
        title={initial ? 'Editar modelo' : 'Novo modelo'}
        description={
          initial
            ? [initial.title, initial.category].filter(Boolean).join(' · ')
            : 'Defina nome, categoria e perguntas do checklist.'
        }
      />

      <div className="grid gap-4 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do modelo"
          required
          className={INPUT}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          className={INPUT}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT}>
          <option>Segurança</option>
          <option>Operação</option>
          <option>Manutenção</option>
          <option>CIPA · Segurança do Trabalho</option>
        </select>
        {headers.length > 0 && (
          <select value={headerId} onChange={(e) => setHeaderId(e.target.value)} className={INPUT}>
            <option value="">Sem header (usa campos próprios, se houver)</option>
            {headers.map((h) => (
              <option key={h.id} value={h.id}>
                Header: {h.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold">Perguntas ({items.length})</h3>
        <div className="flex gap-2">
          <button
            className={`${BTN_SECONDARY} text-xs!`}
            onClick={() => fileInputRef.current?.click()}
          >
            Importar TXT/CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleImportTxt}
            className="hidden"
          />
        </div>
      </div>

      {items.map((item, index) => {
        const isEditing = editingItemId === item.id;
        return (
          <div
            key={item.id}
            className={`bg-surface rounded-lg mb-2 border ${
              isEditing ? 'border-corPadrao' : 'border-line'
            }`}
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <span className="text-gray-600 min-w-6">{index + 1}.</span>
              {isEditing ? (
                <input
                  value={item.title}
                  onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                  className={`${INPUT} flex-1 font-semibold`}
                  autoFocus
                />
              ) : (
                <span
                  className="flex-1 font-semibold cursor-pointer"
                  onClick={() => setEditingItemId(item.id)}
                >
                  {item.title || '(sem título)'}
                  {item.defaultOption && (
                    <span className="text-xs font-normal text-gray-600">
                      {' '}· padrão: {item.defaultOption}
                    </span>
                  )}
                </span>
              )}
              <button
                className={`${BTN_SECONDARY} text-xs!`}
                onClick={() => setEditingItemId(isEditing ? null : item.id)}
              >
                {isEditing ? 'Fechar' : 'Editar'}
              </button>
              <button
                className={`${BTN_SECONDARY} text-xs! text-orange!`}
                onClick={() => handleRemoveItem(item.id)}
              >
                Remover
              </button>
            </div>

            {isEditing && (
              <div className="px-3 pb-3">
                <p className="text-xs text-gray-600 mb-2">
                  Opções ({item.options.length}/{OPTION.max}) — "Outros" é obrigatório e sempre o último.
                  Marque <strong>Padrão</strong> na opção que já deve vir pré-selecionada; sem marcação, a resposta é individual:
                </p>
                {item.options.map((opt, oi) => {
                  const isOutros = opt === OPTION.outrosLabel;
                  const canBeDefault = Boolean(opt.trim());
                  return (
                    <div key={oi} className="flex gap-2 mb-1.5 items-center">
                      <span className="text-gray-400 text-xs min-w-[18px]">{oi + 1}.</span>
                      <input
                        value={opt}
                        onChange={(e) => handleUpdateOption(item.id, oi, e.target.value)}
                        disabled={isOutros}
                        className={`${INPUT} flex-1! text-[13px]`}
                      />
                      <label
                        title="Resposta padrão desta pergunta"
                        className={`flex items-center gap-1 text-xs ${
                          item.defaultOption === opt ? 'text-corPadrao' : 'text-gray-600'
                        } ${canBeDefault ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                      >
                        <input
                          type="checkbox"
                          checked={item.defaultOption === opt}
                          disabled={!canBeDefault}
                          onChange={() => handleToggleDefault(item.id, opt)}
                          className="w-3.5 h-3.5 m-0"
                        />
                        Padrão
                      </label>
                      {!isOutros && item.options.length > OPTION.min && (
                        <button
                          className={`${BTN_SECONDARY} px-2! py-1! text-[11px]`}
                          onClick={() => handleRemoveOption(item.id, oi)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
                {item.options.length < OPTION.max && (
                  <button
                    className={`${BTN_SECONDARY} text-xs! mt-1`}
                    onClick={() => handleAddOption(item.id)}
                  >
                    + Adicionar opção
                  </button>
                )}
                <div className="mt-3">
                  <label className="text-xs text-gray-600">Dica / Observação (opcional — aparece como tooltip na execução)</label>
                  <textarea
                    value={item.hint || ''}
                    onChange={(e) => handleUpdateItemHint(item.id, e.target.value)}
                    placeholder="Ex.: Verificar se o equipamento está dentro da validade"
                    rows={2}
                    className={`${INPUT} mt-1`}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex gap-2 mt-4">
        <input
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Nova pergunta"
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          className={INPUT}
        />
        <button className={BTN_SUCCESS} onClick={handleAddItem}>
          Adicionar
        </button>
      </div>

      <div className="flex gap-3 mt-8">
        <button className={BTN_WARNING} onClick={onCancel}>
          Cancelar
        </button>
        <button className={BTN_PRIMARY} onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar modelo'}
        </button>
      </div>
      {error && (
        <p className="text-orange mt-3 text-sm">{error}</p>
      )}
    </div>
  );
}
