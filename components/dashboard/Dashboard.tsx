import type { Template } from "../../domain/checklist";
import { TemplateCard } from "../templates/TemplateCard";
import { MainHero } from "../main/MainHero";
import { BTN_PRIMARY, BTN_SECONDARY } from "../ui/classes";

interface DashboardProps {
  templates: Template[];
  onRun: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onNew: () => void;
}

export function Dashboard({
  templates,
  onRun,
  onEdit,
  onDelete,
  onNew,
}: DashboardProps) {
  return (
    <div>
      <MainHero>
        <div className="flex gap-3 mt-5">
          <button className={BTN_PRIMARY} onClick={onNew}>
            Novo checklist
          </button>
          <button
            className={BTN_SECONDARY}
            onClick={() => {
              if (templates.length > 0) onRun(templates[0]);
            }}
          >
            Executar agora
          </button>
        </div>
      </MainHero>

      <div className="flex justify-end mb-[5px]">
        <span className="bg-mint text-corPadrao font-bold text-[11px] px-3.5 py-1.5 rounded-full">
          {templates.length} Modelos Ativos
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-4">
        Modelos recentes
      </h3>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {templates.slice(0, 6).map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onRun={() => onRun(template)}
            onEdit={() => onEdit(template)}
            onDelete={() => onDelete(template)}
          />
        ))}
      </div>
    </div>
  );
}
