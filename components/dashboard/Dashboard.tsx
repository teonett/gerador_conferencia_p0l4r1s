import type { Template } from "../../domain/checklist";
import { COLORS } from "../../domain/constants";
import { TemplateCard } from "../templates/TemplateCard";
import { MainHero } from "../main/MainHero";

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
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button className="primary" onClick={onNew}>
            Novo checklist
          </button>
          <button
            className="secondary"
            onClick={() => {
              if (templates.length > 0) onRun(templates[0]);
            }}
          >
            Executar agora
          </button>
        </div>
      </MainHero>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 5 }}
      >
        <span
          style={{
            backgroundColor: COLORS.mint,
            color: COLORS.corPadrao,
            fontWeight: 700,
            fontSize: 11,
            padding: "6px 14px",
            borderRadius: 999,
          }}
        >
          {templates.length} Modelos Ativos
        </span>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
        Modelos recentes
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
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
