import { jsPDF } from "jspdf";
import type { Template, Item } from "../domain/checklist";
import type { HeaderModel } from "../domain/header";

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function blobToImage(blob: Blob): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const maxSide = 800;
        const scale = Math.min(
          1,
          maxSide / Math.max(img.naturalWidth || 1, img.naturalHeight || 1),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
import { PDF, COLORS, METRIC_COLORS, PHOTO } from "../domain/constants";
import { computeAnswerMetrics } from "../domain/metrics";

function formatHeaderDate(value?: string): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

export async function generatePdf(
  template: Template,
  answers: Record<string, string[]>,
  metadata: Record<string, string>,
  observations: string,
  signature: string,
  confirmedAt: string,
  photos: Record<string, Blob[]> = {},
  header?: HeaderModel,
  extraItems: Item[] = [],
): Promise<void> {
  const allItems = [...template.items, ...extraItems];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let logoData: Uint8Array | null = null;
  let logoFormat: "PNG" | "JPEG" = "PNG";
  let logoBg = "transparent";
  try {
    const settingsRes = await fetch("/api/settings");
    const settingsData = (await settingsRes.json()) as {
      logoUrl?: string | null;
      logoBg?: string;
    };
    if (settingsData.logoUrl) {
      const imgRes = await fetch(settingsData.logoUrl);
      if (imgRes.ok) {
        logoData = new Uint8Array(await imgRes.arrayBuffer());
        logoFormat = (imgRes.headers.get("content-type") || "").includes("jpeg")
          ? "JPEG"
          : "PNG";
      }
    }
    if (settingsData.logoBg) logoBg = settingsData.logoBg;
  } catch {
    logoData = null;
  }

  doc.setFillColor(COLORS.corPadrao);
  doc.rect(0, 0, pageWidth, PDF.headerHeight, "F");

  if (logoData) {
    try {
      const props = doc.getImageProperties(logoData);
      const ratio = props.height > 0 ? props.width / props.height : 1;
      const slotW = PDF.logo.slotWidth * PDF.logo.scale;
      const slotH = PDF.logo.slotHeight * PDF.logo.scale;

      let drawW = slotW;
      let drawH = drawW / ratio;
      if (drawH > slotH) {
        drawH = slotH;
        drawW = drawH * ratio;
      }

      const logoX = pageWidth - 14 - drawW;
      const logoY = (PDF.headerHeight - drawH) / 2;

      if (logoBg !== "transparent") {
        doc.setFillColor(...hexToRgb(logoBg));
        doc.roundedRect(logoX - 2, logoY - 2, drawW + 4, drawH + 4, 2, 2, "F");
        doc.setFillColor(COLORS.corPadrao);
      }

      doc.addImage(logoData, logoFormat, logoX, logoY, drawW, drawH);
    } catch {
      logoData = null;
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(template.title, 14, 14, {
    maxWidth: pageWidth - (logoData ? 62 : 28),
  });
  if (template.description) {
    doc.setFontSize(9);
    doc.text(template.description, 14, 21, { maxWidth: pageWidth - 28 });
  }

  let y = PDF.headerHeight + 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  if (header) {
    doc.text(
      `Data: ${formatHeaderDate(metadata.data)}      Hora: ${metadata.hora || "—"}`,
      14,
      y,
    );
    y += 7;
    header.fields.forEach((field, i) => {
      const col = i % 2;
      if (col === 0 && i > 0) y += 7;
      doc.text(
        `${field.label}: ${metadata[field.id]?.trim() || "—"}`,
        col === 0 ? 14 : pageWidth / 2,
        y,
      );
    });
    y += 10;
  } else {
    for (const [key, value] of Object.entries(metadata)) {
      doc.text(`${key}: ${value}`, 14, y);
      y += 6;
    }
  }

  y += 4;

  const metrics = computeAnswerMetrics(allItems, answers);
  const pct = metrics.total
    ? Math.round((metrics.answered / metrics.total) * 100)
    : 0;
  const chips: Array<{ label: string; bg: string; fg: string }> = [
    { label: `Sim: ${metrics.yes}`, bg: METRIC_COLORS.yes, fg: "#ffffff" },
    { label: `Não: ${metrics.no}`, bg: METRIC_COLORS.no, fg: "#ffffff" },
    {
      label: `Outros: ${metrics.other}`,
      bg: METRIC_COLORS.other,
      fg: COLORS.ink,
    },
    {
      label: `Pendentes: ${metrics.pending}`,
      bg: METRIC_COLORS.pending,
      fg: COLORS.ink,
    },
  ];

  doc.setFontSize(8);
  let cx = 14;
  for (const chip of chips) {
    const chipWidth = doc.getTextWidth(chip.label) + 6;
    doc.setFillColor(...hexToRgb(chip.bg));
    doc.roundedRect(cx, y - 5, chipWidth, 7, 2, 2, "F");
    doc.setTextColor(...hexToRgb(chip.fg));
    doc.text(chip.label, cx + 3, y);
    cx += chipWidth + 4;
  }
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Concluído: ${metrics.answered}/${metrics.total} (${pct}%)`,
    cx + 2,
    y,
  );
  doc.setTextColor(0, 0, 0);

  y += 12;

  for (const [index, item] of allItems.entries()) {
    const answer = answers[item.id]?.join(", ") || "—";

    if (index % 2 === 1) {
      doc.setFillColor(...hexToRgb(COLORS.cream));
      doc.rect(
        PDF.itemRow.leftX,
        y,
        PDF.itemRow.width,
        PDF.itemRow.minHeight,
        "F",
      );
    }

    doc.setFontSize(10);
    doc.text(item.title, PDF.itemRow.leftX + 4, y + 10, {
      maxWidth: PDF.itemRow.questionTextWidth,
    });

    doc.setFontSize(9);
    doc.text(`Resposta: ${answer}`, PDF.itemRow.leftX + 4, y + 20);

    const blobs = (photos[item.id] || []).slice(0, PHOTO.maxPerQuestion);
    const images = (
      await Promise.all(blobs.map((blob) => blobToImage(blob)))
    ).filter((img): img is HTMLCanvasElement => img !== null);

    if (images.length === 0) {
      doc.setFillColor(220, 220, 220);
      doc.setFontSize(PDF.noImage.fontSize);
      doc.setTextColor(150, 150, 150);
      doc.text(PDF.noImage.text, PDF.itemRow.imageX + 29, y + 20, {
        angle: PDF.noImage.angle,
      });
      doc.setTextColor(0, 0, 0);
    } else {
      const slotX = PDF.itemRow.imageX;
      const slotY = y + 4;
      const slotW = pageWidth - 14 - slotX;
      const slotH = PDF.itemRow.minHeight - 8;
      const cols = images.length === 1 ? 1 : 2;
      const rows = Math.ceil(images.length / cols);
      const cellW = slotW / cols;
      const cellH = slotH / rows;

      images.forEach((canvas, index) => {
        const ratio = canvas.height > 0 ? canvas.width / canvas.height : 1;
        let drawW = cellW;
        let drawH = drawW / ratio;
        if (drawH > cellH) {
          drawH = cellH;
          drawW = drawH * ratio;
        }
        const cellX = slotX + (index % cols) * cellW;
        const cellY = slotY + Math.floor(index / cols) * cellH;
        try {
          doc.addImage(
            canvas,
            "JPEG",
            cellX + (cellW - drawW) / 2,
            cellY + (cellH - drawH) / 2,
            drawW,
            drawH,
          );
        } catch {
          doc.setFontSize(PDF.noImage.fontSize);
          doc.setTextColor(150, 150, 150);
          doc.text("Sem imagem - Não foi processada", cellX + cellW / 2, cellY + cellH / 2, {
            align: "center",
          });
          doc.setTextColor(0, 0, 0);
        }
      });
    }

    y += PDF.itemRow.minHeight + 4;

    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
  }

  y = pageHeight - 40;
  doc.setDrawColor(0);
  doc.line(PDF.signature.lineFromX, y, PDF.signature.lineToX, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(signature.trim() || "-", pageWidth / 2, y + 6, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Checklist feito e finalizado em: ${new Date(confirmedAt).toLocaleString("pt-BR")}`,
    pageWidth / 2,
    y + 12,
    { align: "center" },
  );

  const filename = `relatorio-${template.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}
