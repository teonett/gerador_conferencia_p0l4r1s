import type { Template } from '../../domain/checklist';
import { COLORS, SIDEBAR_WIDTH } from '../../domain/constants';

interface AppShellProps {
  children: React.ReactNode;
  view: string;
  onNavigate: (view: 'home' | 'templates' | 'run' | 'report') => void;
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
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        className="sidebar"
        style={{
          width: SIDEBAR_WIDTH,
          backgroundColor: 'white',
          borderRight: `1px solid ${COLORS.line}`,
          padding: '24px 16px',
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.green }}>
          Checklist Fácil
        </h1>
        <nav style={{ marginTop: 24 }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: view === 'home' ? COLORS.mint : 'transparent',
              color: COLORS.ink,
              fontWeight: view === 'home' ? 600 : 400,
            }}
          >
            Visão geral
          </button>
          <button
            onClick={() => onNavigate('templates')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: view === 'templates' ? COLORS.mint : 'transparent',
              color: COLORS.ink,
              fontWeight: view === 'templates' ? 600 : 400,
            }}
          >
            Modelos
          </button>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: '32px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
