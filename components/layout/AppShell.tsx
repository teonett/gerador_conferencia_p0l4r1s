import { useEffect, useState } from "react";
import type { Template, View } from "../../domain/checklist";
import { COLORS, SIDEBAR_WIDTH } from "../../domain/constants";

interface AppShellProps {
  children: React.ReactNode;
  view: View;
  onNavigate: (view: View) => void;
  onRun: (template: Template) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        className="sidebar"
        style={{
          width: SIDEBAR_WIDTH,
          backgroundColor: "white",
          borderRight: `1px solid ${COLORS.line}`,
          padding: "24px 16px",
        }}
      >
        {logoUrl && (
          <span
            style={{
              display: "inline-block",
              backgroundColor: logoBg === "transparent" ? undefined : logoBg,
              padding: logoBg === "transparent" ? 0 : "8px 12px",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <img
              src={logoUrl}
              alt="Logo"
              style={{ maxHeight: 56, maxWidth: "100%", display: "block" }}
            />
          </span>
        )}
        <h1 style={{ fontSize: 12, fontWeight: 650, color: COLORS.corPadrao }}>
          Gerador de Checklists
        </h1>
        <nav style={{ marginTop: 24 }}>
          <button
            onClick={() => onNavigate("home")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              borderRadius: 8,
              backgroundColor: view === "home" ? COLORS.mint : "transparent",
              color: COLORS.ink,
              fontWeight: view === "home" ? 600 : 400,
            }}
          >
            Início
          </button>
          <button
            onClick={() => onNavigate("templates")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              borderRadius: 8,
              backgroundColor:
                view === "templates" ? COLORS.mint : "transparent",
              color: COLORS.ink,
              fontWeight: view === "templates" ? 600 : 400,
            }}
          >
            Novo Modelo
          </button>

          <button
            onClick={() => onNavigate("headers")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              borderRadius: 8,
              backgroundColor: view === "headers" ? COLORS.mint : "transparent",
              color: COLORS.ink,
              fontWeight: view === "headers" ? 600 : 400,
            }}
          >
            Cabeçalho de Modelos
          </button>
          <button
            onClick={() => onNavigate("settings")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              borderRadius: 8,
              backgroundColor:
                view === "settings" ? COLORS.mint : "transparent",
              color: COLORS.ink,
              fontWeight: view === "settings" ? 600 : 400,
            }}
          >
            Configurações
          </button>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
