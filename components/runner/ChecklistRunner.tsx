import { useEffect, useState } from "react";
import type { Template, Item } from "../../domain/checklist";
import type { HeaderModel } from "../../domain/header";
import { buildInitialAnswers } from "../../domain/checklist";
import { PHOTO, OPTION } from "../../domain/constants";
import { applyDefaultAnswer } from "../../domain/metrics";
import { AnswerMetricsBar } from "../metrics/AnswerMetricsBar";
import { CameraCapture } from "../camera/CameraCapture";
import { PageHero } from "../layout/PageHero";
import { normalizeImage } from "../../lib/images";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_WARNING,
  CARD,
  FIELD_LABEL,
  HEADER_DATE_INPUT,
  HEADER_DATETIME,
  HEADER_GRID,
  HEADER_TIME_INPUT,
  INPUT,
} from "../ui/classes";

interface ChecklistRunnerProps {
  template: Template;
  header?: HeaderModel;
  initialAnswers?: Record<string, string[]>;
  initialMetadata?: Record<string, string>;
  initialObservations?: Record<string, string>;
  initialPhotos?: Record<string, File[]>;
  initialExtraItems?: Item[];
  onFinish: (data: {
    answers: Record<string, string[]>;
    metadata: Record<string, string>;
    itemObservations: Record<string, string>;
    photos: Record<string, File[]>;
    signature: string;
    confirmedAt: string;
    extraItems: Item[];
  }) => void;
  onBack: () => void;
  onRestart: () => void;
}

export function ChecklistRunner({
  template,
  header,
  initialAnswers,
  initialMetadata,
  initialObservations,
  initialPhotos,
  initialExtraItems,
  onFinish,
  onBack,
  onRestart,
}: ChecklistRunnerProps) {
  const [answers, setAnswers] = useState(
    () => initialAnswers || buildInitialAnswers(template.items),
  );
  const [metadata, setMetadata] = useState<Record<string, string>>(
    initialMetadata || {},
  );
  const [itemObservations, setItemObservations] = useState<
    Record<string, string>
  >(initialObservations || {});
  const [photos, setPhotos] = useState<Record<string, File[]>>(
    initialPhotos || {},
  );
  const [extraItems, setExtraItems] = useState<Item[]>(initialExtraItems || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [showIdentification, setShowIdentification] = useState(!!header);
  const [extraTitle, setExtraTitle] = useState("");

  useEffect(() => {
    setShowIdentification(!!header);
    if (!header) return;
    setMetadata((prev) => {
      if (prev.data && prev.hora) return prev;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      return {
        ...prev,
        data: prev.data || now.toISOString().slice(0, 10),
        hora: prev.hora || hhmm,
      };
    });
  }, [header]);

  const items = [...template.items, ...extraItems];
  const currentItem: Item | null = items[currentIndex] || null;
  const isLast = currentIndex === items.length - 1;

  const handleAnswer = (itemId: string, value: string[]) => {
    setAnswers({ ...answers, [itemId]: value });
    setValidationError("");
  };

  const handleAddExtra = () => {
    const title = extraTitle.trim();
    if (!title) return;
    setExtraItems([
      ...extraItems,
      {
        id: `extra-${crypto.randomUUID().slice(0, 8)}`,
        title,
        required: false,
        options: ["Sim", "Não", OPTION.outrosLabel],
        answerType: "choice",
        selection: "single",
      },
    ]);
    setExtraTitle("");
  };

  const handleRemoveExtra = (id: string) => {
    const next = extraItems.filter((e) => e.id !== id);
    setExtraItems(next);
    const newLen = template.items.length + next.length;
    if (currentIndex > newLen - 1) {
      setCurrentIndex(Math.max(0, newLen - 1));
    }
    setValidationError("");
  };

  const handleAddPhoto = async (itemId: string, file: File) => {
    const current = photos[itemId] || [];
    if (current.length >= PHOTO.maxPerQuestion) return;
    const blob = await normalizeImage(file);
    const normalized = new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "") || "foto"}.jpg`,
      { type: "image/jpeg" },
    );
    setPhotos({ ...photos, [itemId]: [...current, normalized] });
  };

  const handleRemovePhoto = (itemId: string, index: number) => {
    const current = photos[itemId] || [];
    setPhotos({ ...photos, [itemId]: current.filter((_, i) => i !== index) });
  };

  const validateCurrent = (): boolean => {
    if (!currentItem) return true;

    if (
      currentItem.required &&
      (!answers[currentItem.id] || answers[currentItem.id].length === 0)
    ) {
      setValidationError("Esta pergunta é obrigatória.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrent()) return;

    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
      setValidationError("");
    } else {
      onFinish({
        answers,
        metadata,
        itemObservations,
        photos,
        signature: "",
        confirmedAt: "",
        extraItems,
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setValidationError("");
    } else if (header) {
      setShowIdentification(true);
    }
  };

  const currentPhotos = currentItem ? photos[currentItem.id] || [] : [];
  const inIdentification = !!header && showIdentification;

  return (
    <div>
      <PageHero title={template.title} description={template.description} />

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button className={BTN_SECONDARY} onClick={onBack}>
            ← Voltar
          </button>
          <button
            className={BTN_SECONDARY}
            onClick={onRestart}
            title="Zerar este preenchimento (descarta o rascunho)"
          >
            ♻ Recomeçar
          </button>
        </div>
        <span className="text-gray-600 text-sm">
          {inIdentification
            ? "Identificação"
            : `Etapa ${currentIndex + 1} de ${items.length}`}
        </span>
      </div>

      {inIdentification && (
        <div className={`${CARD} p-6 border border-line`}>
          <h3 className="text-base font-semibold mb-3">Identificação</h3>
          <div className={HEADER_DATETIME}>
            <div>
              <label className={FIELD_LABEL}>Data</label>
              <input
                type="date"
                value={metadata["data"] || ""}
                onChange={(e) =>
                  setMetadata({ ...metadata, data: e.target.value })
                }
                className={`${INPUT} ${HEADER_DATE_INPUT}`}
              />
            </div>
            <div>
              <label className={FIELD_LABEL}>Hora</label>
              <input
                type="time"
                value={metadata["hora"] || ""}
                onChange={(e) =>
                  setMetadata({ ...metadata, hora: e.target.value })
                }
                className={`${INPUT} ${HEADER_TIME_INPUT}`}
              />
            </div>
          </div>
          <div className={HEADER_GRID}>
            {header?.fields.map((field) => (
              <div key={field.id}>
                <label className={FIELD_LABEL}>{field.label}</label>
                <input
                  value={metadata[field.id] || ""}
                  onChange={(e) =>
                    setMetadata({ ...metadata, [field.id]: e.target.value })
                  }
                  className={INPUT}
                />
              </div>
            ))}
          </div>
          <button
            className={`${BTN_PRIMARY} mt-5`}
            onClick={() => setShowIdentification(false)}
          >
            Iniciar perguntas →
          </button>
        </div>
      )}

      {!header && template.fields && (
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-3">Identificação</h3>
          {template.fields.map((field) => (
            <div key={field.id} className="mb-3">
              <label className={FIELD_LABEL}>
                {field.label}
                {field.required && <span className="text-orange">*</span>}
              </label>
              <input
                type={field.type}
                value={metadata[field.id] || ""}
                onChange={(e) =>
                  setMetadata({ ...metadata, [field.id]: e.target.value })
                }
                required={field.required}
                className={INPUT}
              />
            </div>
          ))}
        </div>
      )}

      {!inIdentification && currentItem && (
        <div className={`${CARD} p-6 border border-line`}>
          <h3 className="text-base font-semibold mb-4">
            {currentIndex + 1}. {currentItem.title}
            {currentItem.required && <span className="text-orange"> *</span>}
            {currentItem.hint ? (
              <span className="relative group inline-block ml-2 align-middle">
                <span className="text-xs text-corPadrao cursor-help">ℹ️</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-ink text-white text-xs p-2 leading-tight opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {currentItem.hint}
                </span>
              </span>
            ) : (
              <span
                className="inline-block ml-2 align-middle opacity-20 text-xs cursor-default"
                title=""
              >
                ℹ️
              </span>
            )}
          </h3>

          {currentItem.answerType === "text" ? (
            <input
              value={answers[currentItem.id]?.[0] || ""}
              onChange={(e) => handleAnswer(currentItem.id, [e.target.value])}
              placeholder="Digite sua resposta"
              className={INPUT}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentItem.options.map((option) => {
                const isSelected = answers[currentItem.id]?.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => {
                      if (currentItem.selection === "single") {
                        handleAnswer(
                          currentItem.id,
                          isSelected ? [] : [option],
                        );
                      } else {
                        const current = answers[currentItem.id] || [];
                        handleAnswer(
                          currentItem.id,
                          isSelected
                            ? current.filter((o) => o !== option)
                            : [...current, option],
                        );
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border ${
                      isSelected
                        ? "border-corPadrao bg-mint text-corPadrao"
                        : "border-line bg-surface text-ink"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5">
            <label className={FIELD_LABEL}>
              Observação desta pergunta (opcional)
            </label>
            <textarea
              value={itemObservations[currentItem.id] || ""}
              onChange={(e) => {
                setItemObservations({
                  ...itemObservations,
                  [currentItem.id]: e.target.value,
                });
                setValidationError("");
              }}
              placeholder="Observações específicas desta pergunta"
              rows={2}
              className={INPUT}
            />
          </div>

          <div className="mt-4">
            <label className={FIELD_LABEL}>
              Fotos (opcional, máx. {PHOTO.maxPerQuestion})
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentPhotos.map((file, pi) => (
                <div
                  key={pi}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-line"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Foto ${pi + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(currentItem.id, pi)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 text-xs cursor-pointer flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {currentPhotos.length < PHOTO.maxPerQuestion && (
              <div className="flex gap-2">
                <button
                  className={`${BTN_SECONDARY} px-4 py-2 text-[13px] border-dashed`}
                  onClick={() => setCameraOpen(true)}
                >
                  📷 Tirar foto
                </button>
                <label className="inline-block px-4 py-2 rounded-lg border border-dashed border-line cursor-pointer text-[13px] text-gray-600">
                  + Galeria
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAddPhoto(currentItem.id, file);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {!inIdentification && validationError && (
        <p className="text-orange mt-3 text-sm">{validationError}</p>
      )}

      {!inIdentification && (
        <div className="flex justify-between mt-6">
          <button
            className={BTN_SECONDARY}
            onClick={handlePrev}
            disabled={currentIndex === 0 && !header}
          >
            Anterior
          </button>
          <button className={BTN_PRIMARY} onClick={handleNext}>
            {isLast ? "Revisar e assinar" : "Próximo"}
          </button>
        </div>
      )}

      {!inIdentification && (
        <div
          className={`${CARD} p-4 mt-6 border border-dashed border-orange/40`}
        >
          <p className="text-[13px] text-gray-600 mb-2">
            <strong>Pergunta Extra: </strong>Caso precise registrar mais algum
            registro?
          </p>
          <div className="flex gap-2">
            <input
              value={extraTitle}
              onChange={(e) => setExtraTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddExtra()}
              placeholder="Ex.: Houve intercorrência na vistoria?"
              className={INPUT}
            />
            <button
              className={BTN_WARNING}
              onClick={handleAddExtra}
              disabled={!extraTitle.trim()}
            >
              [+]Adicionar
            </button>
          </div>
          {extraItems.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {extraItems.map((extra) => (
                <li
                  key={extra.id}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px]"
                >
                  <span>{extra.title}</span>
                  <button
                    onClick={() => handleRemoveExtra(extra.id)}
                    className="text-orange cursor-pointer"
                    title="[-]Remover"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!inIdentification && (
        <div className="mb-6">
          <AnswerMetricsBar items={items} answers={answers} />
        </div>
      )}

      {cameraOpen && currentItem && (
        <CameraCapture
          onCapture={(file) => {
            handleAddPhoto(currentItem.id, file);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
