import { useState } from "react";
import type { ReactNode } from "react";
import type { HeaderModel, HeaderField } from "../../domain/header";
import { HEADER_DEFAULT_FIELDS } from "../../domain/header";
import { CONFIRM_DELETE_PHRASE } from "../../domain/constants";
import { MainHero } from "../main/MainHero";
import { ConfirmModal } from "../main/ConfirmModal";
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, CARD, INPUT } from "../ui/classes";

type Draft = { key: string; id: string; label: string };

interface HeadersViewProps {
  headers: HeaderModel[];
  onHeadersChanged: () => void;
}

function toDrafts(fields: HeaderField[]): Draft[] {
  return fields.map((f) => ({
    key: crypto.randomUUID(),
    id: f.id,
    label: f.label,
  }));
}

export function HeadersView({ headers, onHeadersChanged }: HeadersViewProps) {
  const [editing, setEditing] = useState<HeaderModel | null>(null);
  const [name, setName] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<HeaderModel | null>(null);

  const startNew = () => {
    setEditing({ id: "", name: "", fields: [] });
    setName("");
    setDrafts(toDrafts(HEADER_DEFAULT_FIELDS));
    setError("");
  };

  const startEdit = (header: HeaderModel) => {
    setEditing(header);
    setName(header.name);
    setDrafts(
      toDrafts(
        header.fields.length > 0 ? header.fields : HEADER_DEFAULT_FIELDS,
      ),
    );
    setError("");
  };

  const cancel = () => {
    setEditing(null);
    setError("");
  };

  const updateLabel = (key: string, label: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.key === key ? { ...d, label, id: slugify(label) || d.id } : d,
      ),
    );
  };

  const addField = () => {
    setDrafts((prev) => [
      ...prev,
      { key: crypto.randomUUID(), id: `campo-${prev.length + 1}`, label: "" },
    ]);
  };

  const removeField = (key: string) => {
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Informe o nome do header.");
      return;
    }
    if (drafts.some((d) => !d.label.trim())) {
      setError("Todos os campos precisam de um rótulo.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        fields: drafts.map((d) => ({ id: d.id, label: d.label.trim() })),
      };
      const res = editing?.id
        ? await fetch(`/api/headers/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/headers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error();
      setEditing(null);
      onHeadersChanged();
    } catch {
      setError("Não foi possível salvar o header.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      const res = await fetch(`/api/headers/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onHeadersChanged();
    } catch {
      setError("Não foi possível excluir o header.");
    }
  };

  let content: ReactNode;

  if (editing) {
    content = (
      <div className="bg-surface rounded-xl p-6 border border-line">
        <h3 className="text-base font-semibold">
          {editing.id ? "Editar header" : "Novo Cabeçalho"}
        </h3>
        <p className="text-[13px] text-gray-600 mt-1">
          Data e hora fazem parte de todo header e aparecem na primeira linha.
        </p>

        <label className="block text-[13px] font-semibold mt-4 mb-1.5">Nome do header</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Inspeção Administrativa"
          className={INPUT}
        />

        <label className="block text-[13px] font-semibold mt-5 mb-1.5">
          Campos adicionais
        </label>
        {drafts.map((draft, index) => (
          <div key={draft.key} className="flex gap-2 mb-2">
            <input
              value={draft.label}
              onChange={(e) => updateLabel(draft.key, e.target.value)}
              placeholder={`Campo ${index + 1}`}
              className={INPUT}
            />
            <button className={BTN_SECONDARY} onClick={() => removeField(draft.key)} title="Remover campo">
              🗑
            </button>
          </div>
        ))}
        <button className={BTN_SECONDARY} onClick={addField}>
          + Adicionar campo
        </button>

        {error && (
          <p className="mt-3 text-orange text-[13px]">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <button className={BTN_PRIMARY} onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar header"}
          </button>
          <button className={BTN_SECONDARY} onClick={cancel} disabled={saving}>
            Cancelar
          </button>
        </div>
      </div>
    );
  } else if (headers.length === 0) {
    content = (
      <div className="text-center py-10 px-4">
        <p className="text-gray-600">Nenhum header cadastrado ainda.</p>
        <button className={`${BTN_PRIMARY} mt-4`} onClick={startNew}>
          Criar Novo Cabeçalho
        </button>
      </div>
    );
  } else {
    content = (
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {headers.map((header) => (
          <div key={header.id} className="bg-surface rounded-xl p-4 border border-line">
            <p className="font-semibold">{header.name}</p>
            <p className="text-[13px] text-gray-600 mt-1">
              Data · Hora
              {header.fields.length > 0
                ? ` + ${header.fields.length} campos`
                : ""}
            </p>
            <ul className="mt-2 pl-[18px] text-[13px] text-gray-500">
              {header.fields.map((field) => (
                <li key={field.id}>{field.label}</li>
              ))}
            </ul>
            <div className="flex gap-2 mt-3">
              <button className={BTN_PRIMARY} onClick={() => startEdit(header)}>
                Editar
              </button>
              <button className={BTN_DANGER} onClick={() => setDeleteTarget(header)}>
                🗑 Excluir
              </button>
            </div>
          </div>
        ))}
        <button className={`${BTN_SECONDARY} p-6 rounded-xl`} onClick={startNew}>
          + Novo Cabeçalho
        </button>
      </div>
    );
  }

  return (
    <div>
      <MainHero
        title="Cabeçalho de Modelos"
        description="Campos de identificação reutilizáveis pelos modelos de checklist."
      />
      <div className={`${CARD} p-6 mb-6`}>
        {content}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir header"
        description={`O header "${deleteTarget?.name || ""}" será removido. Modelos associados ficarão sem identificação.`}
        confirmPhrase={CONFIRM_DELETE_PHRASE}
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .trim();
}
