import { useEffect, useState } from "react";
import type { Template, View } from "../../domain/checklist";
import { SIDEBAR_WIDTH } from "../../domain/constants";

interface AppShellProps {
  children: React.ReactNode;
  view: View;
  onNavigate: (view: View) => void;
  onRun: (template: Template) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
}

const NAV_BASE = "block w-full text-left px-4 py-3 rounded-lg";

function navClass(active: boolean): string {
  return `${NAV_BASE} ${active ? "bg-mint font-semibold" : ""} text-ink`;
}

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  try {
    if (document.documentElement.classList.contains("dark")) return "dark";
  } catch {
    /* SSR/ambiente sem DOM */
  }
  return "light";
}

export function AppShell({
  children,
  view,
  onNavigate,
  templates: _templates,
  setTemplates: _setTemplates,
}: AppShellProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoBg, setLogoBg] = useState<string>("transparent");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage indisponível */
    }
  };

  useEffect(() => {
    const loadLogo = () =>
      fetch("/api/settings")
        .then((res) => res.json())
        .then((payload) => {
          const data = payload as { logoUrl?: string | null; logoBg?: string };
          setLogoUrl(data.logoUrl || null);
          setLogoBg(data.logoBg || "transparent");
        })
        .catch(() => {});

    loadLogo();
    window.addEventListener("logo-updated", loadLogo);
    return () => window.removeEventListener("logo-updated", loadLogo);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside
        className="sidebar hidden min-[600px]:block bg-surface border-r border-line py-6 px-4 shrink-0"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {logoUrl && (
          <span
            className={`inline-block rounded-lg mb-3 ${
              logoBg === "transparent" ? "" : "px-3 py-2"
            }`}
            style={logoBg === "transparent" ? undefined : { backgroundColor: logoBg }}
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="max-h-14 max-w-full block"
            />
          </span>
        )}
        <h1 className="text-xs font-bold text-corPadrao">
          Gerador de Checklists
        </h1>
        <nav className="mt-6">
          <button onClick={() => onNavigate("home")} className={navClass(view === "home")}>
            Início
          </button>
          <button onClick={() => onNavigate("templates")} className={navClass(view === "templates")}>
            Novo Modelo
          </button>
          <button onClick={() => onNavigate("headers")} className={navClass(view === "headers")}>
            Cabeçalho de Modelos
          </button>
          <button onClick={() => onNavigate("history")} className={navClass(view === "history")}>
            Histórico
          </button>
          <button onClick={() => onNavigate("settings")} className={navClass(view === "settings")}>
            Configurações
          </button>
          <button
            onClick={toggleTheme}
            className={`${NAV_BASE} mt-6 text-ink border border-line`}
            title="Alternar tema claro/escuro"
          >
            {theme === "dark" ? "🌙 Tema escuro" : "☀️ Tema claro"}
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 max-w-[1200px] mx-auto">
        {children}
      </main>
    </div>
  );
}
