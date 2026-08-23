import { useState } from "react";
import type { Template } from "../../domain/checklist";
import { COLORS } from "../../domain/constants";
import { generatePdf } from "../../lib/pdf";
import { AnswerMetricsBar } from "../metrics/AnswerMetricsBar";
import { PageHero } from "../layout/PageHero";

interface ReportReviewProps {
  template: Template;
  answers: Record<string, string[]>;
  metadata: Record<string, string>;
  observations: string;
  photos: Record<string, File[]>;
  signature: string;
  confirmedAt: string;
  onBack: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ReportReview({
  template,
  answers,
  metadata,
  observations,
  photos,
  signature: initialSignature,
  confirmedAt: initialConfirmedAt,
  onBack,
}: ReportReviewProps) {
  const [signature, setSignature] = useState(initialSignature);
  const [confirmed, setConfirmed] = useState(!!initialConfirmedAt);
  const [accepted, setAccepted] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(initialConfirmedAt);
  const [generating, setGenerating] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const persistResponse = async () => {
    try {
      setSaveState("saving");
      const formData = new FormData();
      formData.append("answers", JSON.stringify(answers));
      formData.append("metadata", JSON.stringify(metadata));
      formData.append("observations", observations);
      for (const [itemId, files] of Object.entries(photos)) {
        for (const file of files) {
          formData.append(`photo:${itemId}`, file);
        }
      }
      const res = await fetch(`/api/checklists/${template.id}/responses`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const handleConfirm = () => {
    if (!signature || !accepted) return;
    setConfirmedAt(new Date().toISOString());
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
        observations,
        signature,
        confirmedAt,
        photos,
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHero title={template.title} description={template.description} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <button className="secondary" onClick={onBack}>
          ← Voltar ao preenchimento
        </button>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
        Revisar e assinar
      </h2>

      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <AnswerMetricsBar items={template.items} answers={answers} />
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Identificação
        </h3>
        {Object.entries(metadata).map(([key, value]) => (
          <p key={key}>
            <strong>{key}:</strong> {value}
          </p>
        ))}
      </div>

      {template.items.map((item, index) => {
        const current = answers[item.id] || [];
        const missingRequired = item.required && current.length === 0;
        return (
          <div
            key={item.id}
            style={{
              background: index % 2 === 1 ? COLORS.cream : "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              border: `1px solid ${missingRequired ? COLORS.orange : COLORS.line}`,
            }}
          >
            <p style={{ fontWeight: 600 }}>
              {index + 1}. {item.title}
              {item.required && (
                <span style={{ color: COLORS.orange }}> *</span>
              )}
            </p>
            <p style={{ marginTop: 8, color: COLORS.corPadrao }}>
              Resposta: {current.join(", ") || "—"}
            </p>
            {(photos[item.id]?.length || 0) > 0 && (
              <p style={{ marginTop: 4, fontSize: 13, color: "#666" }}>
                📷 {photos[item.id].length} foto(s)
              </p>
            )}
            {missingRequired && (
              <p style={{ marginTop: 8, fontSize: 13, color: COLORS.orange }}>
                Pergunta obrigatória sem resposta.
              </p>
            )}
          </div>
        );
      })}

      {observations && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <p style={{ fontWeight: 600 }}>Observações</p>
          <p style={{ marginTop: 8 }}>{observations}</p>
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
          border: `1px solid ${COLORS.line}`,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Assinatura
        </h3>
        <input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Nome completo"
          disabled={confirmed}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
          }}
        >
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
            style={{ width: 14, height: 14, margin: 0 }}
          />
          Confirmo que as informações são verdadeiras.
        </label>
        {!confirmed && (
          <button
            className="primary"
            onClick={handleConfirm}
            disabled={!signature || !accepted || saveState === "saving"}
            style={{ marginTop: 16 }}
          >
            {saveState === "saving" ? "Salvando..." : "Confirmar e Finalizar"}
          </button>
        )}
        {saveState === "saved" && (
          <p style={{ marginTop: 12, fontSize: 13, color: COLORS.corPadrao }}>
            ✓ Resposta registrada no histórico.
          </p>
        )}
        {saveState === "error" && (
          <p style={{ marginTop: 12, fontSize: 13, color: COLORS.orange }}>
            Não foi possível salvar no histórico. Você pode baixar o PDF e
            tentar confirmar novamente.
          </p>
        )}
      </div>

      {confirmed && (
        <button
          className="primary"
          onClick={handleDownload}
          disabled={generating}
          style={{ marginTop: 24, width: "100%" }}
        >
          {generating ? "Gerando PDF..." : "Baixar relatório em PDF"}
        </button>
      )}
    </div>
  );
}
