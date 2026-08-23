import { useState } from "react";
import type { ReactNode } from "react";
import type { HeaderModel, HeaderField } from "../../domain/header";
import { HEADER_DEFAULT_FIELDS } from "../../domain/header";
import { COLORS, CONFIRM_DELETE_PHRASE } from "../../domain/constants";
import { MainHero } from "../main/MainHero";
import { ConfirmModal } from "../main/ConfirmModal";

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
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          border: `1px solid ${COLORS.line}`,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>
          {editing.id ? "Editar header" : "Novo Cabeçalho"}
        </h3>
        <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
          Data e hora fazem parte de todo header e aparecem na primeira linha.
        </p>

        <label style={labelStyle}>Nome do header</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Inspeção Administrativa"
        />

        <label style={{ ...labelStyle, marginTop: 20 }}>
          Campos adicionais
        </label>
        {drafts.map((draft, index) => (
          <div
            key={draft.key}
            style={{ display: "flex", gap: 8, marginBottom: 8 }}
          >
            <input
              value={draft.label}
              onChange={(e) => updateLabel(draft.key, e.target.value)}
              placeholder={`Campo ${index + 1}`}
            />
            <button
              className="secondary"
              onClick={() => removeField(draft.key)}
              title="Remover campo"
            >
              🗑
            </button>
          </div>
        ))}
        <button className="secondary" onClick={addField}>
          + Adicionar campo
        </button>

        {error && (
          <p style={{ marginTop: 12, color: COLORS.orange, fontSize: 13 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button className="primary" onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar header"}
          </button>
          <button className="secondary" onClick={cancel} disabled={saving}>
            Cancelar
          </button>
        </div>
      </div>
    );
  } else if (headers.length === 0) {
    content = (
      <div style={{ textAlign: "center", padding: "40px 16px" }}>
        <p style={{ color: "#666" }}>Nenhum header cadastrado ainda.</p>
        <button
          className="primary"
          onClick={startNew}
          style={{ marginTop: 16 }}
        >
          Criar Novo Cabeçalho
        </button>
      </div>
    );
  } else {
    content = (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {headers.map((header) => (
          <div
            key={header.id}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${COLORS.line}`,
            }}
          >
            <p style={{ fontWeight: 600 }}>{header.name}</p>
            <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              Data · Hora
              {header.fields.length > 0
                ? ` + ${header.fields.length} campos`
                : ""}
            </p>
            <ul
              style={{
                marginTop: 8,
                paddingLeft: 18,
                fontSize: 13,
                color: "#555",
              }}
            >
              {header.fields.map((field) => (
                <li key={field.id}>{field.label}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="secondary" onClick={() => startEdit(header)}>
                Editar
              </button>
              <button
                className="secondary"
                onClick={() => setDeleteTarget(header)}
              >
                🗑 Excluir
              </button>
            </div>
          </div>
        ))}
        <button
          className="secondary"
          onClick={startNew}
          style={{ padding: 24, borderRadius: 12 }}
        >
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
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
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

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  margin: "16px 0 6px",
} as const;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .trim();
}
