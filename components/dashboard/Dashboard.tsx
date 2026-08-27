import { useRef } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.offsetWidth / 2;
    el.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

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
      <div className="flex items-center gap-3">
        <button
          onClick={() => scroll('left')}
          className="shrink-0 bg-surface border border-line shadow-md rounded-full w-9 h-9 flex items-center justify-center text-ink cursor-pointer"
        >
          ‹
        </button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-hidden scroll-smooth flex-1 min-w-0">
          {templates.slice(0, 6).map((template) => (
            <div key={template.id} className="shrink-0 w-[calc(50%-8px)]">
              <TemplateCard
                template={template}
                onRun={() => onRun(template)}
                onEdit={() => onEdit(template)}
                onDelete={() => onDelete(template)}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="shrink-0 bg-surface border border-line shadow-md rounded-full w-9 h-9 flex items-center justify-center text-ink cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  );
}
