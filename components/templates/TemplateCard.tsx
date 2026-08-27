import type { Template } from "../../domain/checklist";
import { BTN_DANGER, BTN_PRIMARY, BTN_SUCCESS } from "../ui/classes";

interface TemplateCardProps {
  template: Template;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplateCard({
  template,
  onRun,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  return (
    <div className="bg-surface rounded-xl font-medium p-5 border border-line shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-corPadrao bg-mint px-2 py-0.5 rounded">
            {template.category}
          </span>
          <h4 className="text-base font-semibold mt-5">
            {template.title}
          </h4>
          <p className="text-sm text-gray-600 mt-5">
            {template.description}
          </p>
          <p className="text-xs text-gray-400 mt-5">
            {template.items.length} pergunta
            {template.items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-4 justify-center">
        <button className={BTN_PRIMARY} onClick={onRun}>
          Executar
        </button>
        <button className={BTN_SUCCESS} onClick={onEdit}>
          Editar
        </button>
        <button className={BTN_DANGER} onClick={onDelete}>
          Excluir
        </button>
      </div>
    </div>
  );
}
