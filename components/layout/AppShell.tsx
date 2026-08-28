import { useEffect, useState } from "react";
import type { Template, View } from "../../domain/checklist";
import { DRAWER_WIDTH, MOBILE_BREAKPOINT, SIDEBAR_WIDTH } from "../../domain/constants";

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

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: "home", label: "Início" },
  { view: "templates", label: "Novo Modelo" },
  { view: "headers", label: "Cabeçalho de Modelos" },
  { view: "history", label: "Histórico" },
  { view: "settings", label: "Configurações" },
];

const VIEW_LABELS: Record<View, string> = {
  home: "Início",
  templates: "Novo Modelo",
  headers: "Cabeçalho de Modelos",
  history: "Histórico",
  settings: "Configurações",
  report: "Relatório",
  run: "Executando",
};

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    const update = (e: MediaQueryListEvent) => {
      if (e.matches) setDrawerOpen(false);
    };
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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

  const navigate = (next: View) => {
    setDrawerOpen(false);
    onNavigate(next);
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

  const Brand = (
    <div className={`flex items-center gap-2 ${logoBg === "transparent" ? "" : "p-2 rounded-lg"}`}
      style={logoBg === "transparent" ? undefined : { backgroundColor: logoBg }}>
      {logoUrl ? (
        <img src={logoUrl} alt="Logo" className="max-h-10 max-w-full block" />
      ) : (
        <span className="text-sm font-bold text-corPadrao">
          Gerador de Checklists
        </span>
      )}
    </div>
  );

  const Navigation = (
    <nav className="mt-6">
      {NAV_ITEMS.map(({ view: v, label }) => (
        <button key={v} onClick={() => navigate(v)} className={navClass(view === v)}>
          {label}
        </button>
      ))}
      <button
        onClick={toggleTheme}
        className={`${NAV_BASE} mt-6 text-ink border border-line`}
        title="Alternar tema claro/escuro"
      >
        {theme === "dark" ? "🌙 Tema escuro" : "☀️ Tema claro"}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside
        className="hidden min-[600px]:block fixed inset-y-0 left-0 bg-surface border-r border-line py-6 px-4 shrink-0 z-30"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {logoUrl && (
          <span
            className={`inline-block rounded-lg mb-3 ${
              logoBg === "transparent" ? "" : "px-3 py-2"
            }`}
            style={logoBg === "transparent" ? undefined : { backgroundColor: logoBg }}
          >
            <img src={logoUrl} alt="Logo" className="max-h-14 max-w-full block" />
          </span>
        )}
        <h1 className="text-xs font-bold text-corPadrao">
          Gerador de Checklists
        </h1>
        {Navigation}
      </aside>

      {/* Top bar mobile */}
      <header
        className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-surface border-b border-line px-3 h-14 min-[600px]:hidden"
      >
        <button
          aria-label="Abrir menu"
          onClick={() => setDrawerOpen(true)}
          className="shrink-0 rounded-lg p-2 text-ink cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {Brand}
        <span className="text-sm font-medium text-corPadrao truncate flex-1 text-right">
          {VIEW_LABELS[view]}
        </span>
      </header>

      {/* Backdrop + drawer mobile */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 min-[600px]:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className="fixed inset-y-0 left-0 z-50 bg-surface border-r border-line overflow-y-auto py-4 transition-transform duration-200 min-[600px]:hidden"
        style={{
          width: DRAWER_WIDTH,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between px-4">
          <h1 className="text-xs font-bold text-corPadrao">
            Gerador de Checklists
          </h1>
          <button
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-2 text-ink cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {Navigation}
      </aside>

      {/* Conteúdo */}
      <main
        className="mx-auto pt-[60px] p-4 min-[600px]:pt-8 min-[600px]:p-8 max-w-[1200px] min-[600px]:pl-[264px]"
      >
        {children}
      </main>
    </div>
  );
}
