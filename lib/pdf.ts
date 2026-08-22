import { jsPDF } from 'jspdf';
import type { Template } from '../domain/checklist';

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
import { PDF, COLORS, METRIC_COLORS } from '../domain/constants';
import { computeAnswerMetrics } from '../domain/metrics';

export async function generatePdf(
  template: Template,
  answers: Record<string, string[]>,
  metadata: Record<string, string>,
  observations: string,
  signature: string,
  confirmedAt: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(COLORS.green);
  doc.rect(0, 0, pageWidth, PDF.headerHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(template.title, 14, 14, { maxWidth: pageWidth - 28 });
  if (template.description) {
    doc.setFontSize(9);
    doc.text(template.description, 14, 21, { maxWidth: pageWidth - 28 });
  }

  let y = PDF.headerHeight + 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  for (const [key, value] of Object.entries(metadata)) {
    doc.text(`${key}: ${value}`, 14, y);
    y += 6;
  }

  y += 4;

  const metrics = computeAnswerMetrics(template.items, answers);
  const pct = metrics.total ? Math.round((metrics.answered / metrics.total) * 100) : 0;
  const chips: Array<{ label: string; bg: string; fg: string }> = [
    { label: `Sim: ${metrics.yes}`, bg: METRIC_COLORS.yes, fg: '#ffffff' },
    { label: `Não: ${metrics.no}`, bg: METRIC_COLORS.no, fg: '#ffffff' },
    { label: `Outros: ${metrics.other}`, bg: METRIC_COLORS.other, fg: COLORS.ink },
    { label: `Pendentes: ${metrics.pending}`, bg: METRIC_COLORS.pending, fg: COLORS.ink },
  ];

  doc.setFontSize(8);
  let cx = 14;
  for (const chip of chips) {
    const chipWidth = doc.getTextWidth(chip.label) + 6;
    doc.setFillColor(...hexToRgb(chip.bg));
    doc.roundedRect(cx, y - 5, chipWidth, 7, 2, 2, 'F');
    doc.setTextColor(...hexToRgb(chip.fg));
    doc.text(chip.label, cx + 3, y);
    cx += chipWidth + 4;
  }
  doc.setTextColor(90, 90, 90);
  doc.text(`Concluído: ${metrics.answered}/${metrics.total} (${pct}%)`, cx + 2, y);
  doc.setTextColor(0, 0, 0);

  y += 12;

  for (const item of template.items) {
    const answer = answers[item.id]?.join(', ') || '—';

    doc.setFillColor(245, 245, 245);
    doc.rect(PDF.itemRow.leftX, y, PDF.itemRow.width, PDF.itemRow.minHeight, 'F');

    doc.setFontSize(10);
    doc.text(item.title, PDF.itemRow.leftX + 4, y + 10, {
      maxWidth: PDF.itemRow.questionTextWidth,
    });

    doc.setFontSize(9);
    doc.text(`Resposta: ${answer}`, PDF.itemRow.leftX + 4, y + 20);

    doc.setFillColor(220, 220, 220);
    doc.setFontSize(PDF.noImage.fontSize);
    doc.setTextColor(150, 150, 150);
    doc.text(PDF.noImage.text, PDF.itemRow.imageX + 29, y + 20, {
      angle: PDF.noImage.angle,
    });
    doc.setTextColor(0, 0, 0);

    y += PDF.itemRow.minHeight + 4;

    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
  }

  if (observations) {
    y += 10;
    doc.setFontSize(10);
    doc.text('Observações:', 14, y);
    y += 6;
    doc.text(observations, 14, y, { maxWidth: pageWidth - 28 });
  }

  y = pageHeight - 40;
  doc.setDrawColor(0);
  doc.line(PDF.signature.lineFromX, y, PDF.signature.lineToX, y);
  doc.setFontSize(10);
  doc.text(signature, PDF.signature.lineFromX, y - 4);
  doc.setFontSize(8);
  doc.text(`Confirmado em: ${new Date(confirmedAt).toLocaleString('pt-BR')}`, 14, y + 6);

  const filename = `relatorio-${template.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
