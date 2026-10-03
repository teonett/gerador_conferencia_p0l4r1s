import { useState } from "react";
import type { Template, Item } from "../../domain/checklist";
import type { HeaderModel } from "../../domain/header";
import { generatePdf } from "../../lib/pdf";
import { AnswerMetricsBar } from "../metrics/AnswerMetricsBar";
import { PageHero } from "../layout/PageHero";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD,
  HEADER_DATETIME,
  HEADER_GRID,
  INPUT,
  zebraRow,
} from "../ui/classes";

interface ReportReviewProps {
  template: Template;
  header?: HeaderModel;
  answers: Record<string, string[]>;
  metadata: Record<string, string>;
  itemObservations: Record<string, string>;
  photos: Record<string, (File & { r2Key?: string })[]>;
  signature: string;
  confirmedAt: string;
  extraItems?: Item[];
  editMode?: boolean;
  responseId?: string;
  onBack: () => void;
  onSaved?: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function formatDate(value?: string): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

export function ReportReview({
  template,
  header,
  answers,
  metadata,
  itemObservations,
  photos,
  signature: initialSignature,
  confirmedAt: initialConfirmedAt,
  extraItems = [],
  editMode = false,
  responseId,
  onBack,
  onSaved,
}: ReportReviewProps) {
  const [signature, setSignature] = useState(initialSignature);
  const [confirmed, setConfirmed] = useState(!editMode && !!initialConfirmedAt);
  const [accepted, setAccepted] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(initialConfirmedAt);
  const [generating, setGenerating] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const allItems = [...template.items, ...extraItems];

  const persistResponse = async () => {
    try {
      setSaveState("saving");
      const formData = new FormData();
      formData.append("answers", JSON.stringify(answers));
      formData.append("metadata", JSON.stringify(metadata));
      formData.append("item_observations", JSON.stringify(itemObservations));
      formData.append("signerName", signature);
      formData.append("extra_items", JSON.stringify(extraItems));
      const kept: Record<string, string[]> = {};
      for (const [itemId, files] of Object.entries(photos)) {
        for (const file of files) {
          if (file.r2Key) {
            kept[itemId] = [...(kept[itemId] || []), file.r2Key];
          } else {
            formData.append(`photo:${itemId}`, file);
          }
        }
      }
      if (editMode) {
        formData.append("photos", JSON.stringify(kept));
      }
      const url = editMode
        ? `/api/responses/${responseId}`
        : `/api/checklists/${template.id}/responses`;
      const res = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
      if (onSaved) onSaved();
    } catch {
      setSaveState("error");
    }
  };

  const handleConfirm = () => {
    if (!signature || !accepted) return;
    setConfirmedAt(
      editMode && initialConfirmedAt
        ? initialConfirmedAt
        : new Date().toISOString(),
    );
    setConfirmed(true);
    persistResponse();
  };

  const handleDownload = async () => {
    if (!confirmed) return;
    setGenerating(true);
    try {
      await generatePdf(
        template,
        answers,
        metadata,
        itemObservations,
        signature,
        confirmedAt,
        photos,
        header,
        extraItems,
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHero title={template.title} description={template.description} />

      <div className="flex justify-between mb-6">
        <button className={BTN_SECONDARY} onClick={onBack}>
          ← Voltar ao preenchimento
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-6">
        {editMode ? "Revisar e salvar alterações" : "Revisar e assinar"}
      </h2>

      <div className={`${CARD} p-6 mb-6`}>
        <AnswerMetricsBar items={allItems} answers={answers} />
      </div>

      <div className={`${CARD} p-6 mb-6`}>
        <h3 className="text-base font-semibold mb-4">Identificação</h3>
        {header ? (
          <>
            <div className={HEADER_DATETIME}>
              <div>
                <strong>Data:</strong> {formatDate(metadata.data)}
              </div>
              <div>
                <strong>Hora:</strong> {metadata.hora || "—"}
              </div>
            </div>
            <div className={HEADER_GRID}>
              {header.fields.map((field) => (
                <div key={field.id}>
                  <strong>{field.label}:</strong> {metadata[field.id] || "—"}
                </div>
              ))}
            </div>
          </>
        ) : (
          Object.entries(metadata).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))
        )}
      </div>

      {allItems.map((item, index) => {
        const current = answers[item.id] || [];
        const missingRequired = item.required && current.length === 0;
        const isExtra = index >= template.items.length;
        return (
          <div
            key={item.id}
            className={`${zebraRow(index)} rounded-xl p-4 mb-3 border ${
              missingRequired ? "border-orange" : "border-line"
            }`}
          >
            <p className="font-semibold">
              {index + 1}. {item.title}
              {item.required && <span className="text-orange"> *</span>}
              {isExtra && (
                <span className="text-[11px] font-normal text-gray-600">
                  {" "}
                  (extra)
                </span>
              )}
            </p>
            <p className="mt-2 text-corPadrao">
              Resposta: {current.join(", ") || "—"}
            </p>
            {itemObservations[item.id]?.trim() && (
              <p className="mt-1 text-[13px] text-gray-600">
                Obs.: {itemObservations[item.id]}
              </p>
            )}
            {(photos[item.id]?.length || 0) > 0 && (
              <p className="mt-1 text-[13px] text-gray-600">
                📷 {photos[item.id].length} foto(s)
              </p>
            )}
            {missingRequired && (
              <p className="mt-2 text-[13px] text-orange">
                Pergunta obrigatória sem resposta.
              </p>
            )}
          </div>
        );
      })}

      <div className="bg-surface rounded-xl p-6 mt-6 border border-line">
        <h3 className="text-base font-semibold mb-4">Assinatura</h3>
        <input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Nome completo"
          disabled={confirmed}
          className={INPUT}
        />
        <label className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked);
              if (!e.target.checked) {
                setConfirmed(false);
                setConfirmedAt("");
                setSaveState("idle");
              }
            }}
            className="w-3.5 h-3.5 m-0"
          />
          Confirmo que as informações são verdadeiras.
        </label>
        {!confirmed && (
          <button
            className={`${BTN_PRIMARY} mt-4 disabled:opacity-60`}
            onClick={handleConfirm}
            disabled={!signature || !accepted || saveState === "saving"}
          >
            {saveState === "saving"
              ? "Salvando..."
              : editMode
                ? "Salvar alterações"
                : "Confirmar e Finalizar"}
          </button>
        )}
        {saveState === "saved" && (
          <p className="mt-3 text-[13px] text-corPadrao">
            ✓{" "}
            {editMode
              ? "Alterações salvas no histórico."
              : "Resposta registrada no histórico."}
          </p>
        )}
        {saveState === "error" && (
          <p className="mt-3 text-[13px] text-orange">
            Não foi possível salvar. Você pode baixar o PDF e tentar confirmar
            novamente.
          </p>
        )}
      </div>

      {confirmed && (
        <button
          className={`${BTN_PRIMARY} mt-6 w-full`}
          onClick={handleDownload}
          disabled={generating}
        >
          {generating ? "Gerando PDF..." : "Baixar relatório em PDF"}
        </button>
      )}
    </div>
  );
}
