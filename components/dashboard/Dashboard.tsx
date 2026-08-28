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
      <div className="min-[600px]:flex min-[600px]:items-center min-[600px]:gap-3">
        <button
          onClick={() => scroll('left')}
          className="hidden min-[600px]:block shrink-0 bg-surface border border-line shadow-md rounded-full w-9 h-9 items-center justify-center text-ink cursor-pointer"
        >
          ‹
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 min-[600px]:overflow-x-hidden scroll-smooth min-[600px]:flex-1 min-[600px]:min-w-0 max-[599px]:flex-col overflow-visible"
        >
          {templates.slice(0, 6).map((template) => (
            <div key={template.id} className="shrink-0 w-full min-[600px]:w-[calc(50%-8px)]">
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
          className="hidden min-[600px]:block shrink-0 bg-surface border border-line shadow-md rounded-full w-9 h-9 items-center justify-center text-ink cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  );
}
