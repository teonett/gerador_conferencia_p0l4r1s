import { useState, useEffect } from 'react';
import type { Template, View } from '../domain/checklist';
import type { HeaderModel } from '../domain/header';
import { CONFIRM_DELETE_PHRASE } from '../domain/constants';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../components/dashboard/Dashboard';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { ChecklistRunner } from '../components/runner/ChecklistRunner';
import { ReportReview } from '../components/report/ReportReview';
import { ResponseHistory } from '../components/history/ResponseHistory';
import { SettingsView } from '../components/settings/SettingsView';
import { ConfirmModal } from '../components/main/ConfirmModal';
import { HeadersView } from '../components/headers/HeadersView';

function applyPrimaryColor(hex: string) {
  const root = document.documentElement;
  root.style.setProperty('--color-corPadrao', hex);
  root.style.setProperty('--color-mint', hex + '22');
}

export function App() {
  const [view, setView] = useState<View>('home');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState('');
  const [photos, setPhotos] = useState<Record<string, File[]>>({});
  const [signature, setSignature] = useState('');
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [headers, setHeaders] = useState<HeaderModel[]>([]);

  const loadHeaders = () => {
    fetch('/api/headers')
      .then((res) => res.json())
      .then((payload) => {
        const data = payload as { headers?: HeaderModel[] };
        if (data.headers) setHeaders(data.headers);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadHeaders();
  }, []);

  useEffect(() => {
    const loadSettings = () =>
      fetch('/api/settings')
        .then((res) => res.json())
        .then((payload) => {
          const data = payload as { primaryColor?: string };
          if (data.primaryColor) applyPrimaryColor(data.primaryColor);
        })
        .catch(() => {});

    loadSettings();
    window.addEventListener('logo-updated', loadSettings);
    return () => window.removeEventListener('logo-updated', loadSettings);
  }, []);

  useEffect(() => {
    fetch('/api/checklists')
      .then((res) => res.json())
      .then((data) => {
        if (data.checklists) setTemplates(data.checklists);
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('checklist');
    if (shareToken) {
      fetch(`/api/checklists?share=${shareToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.checklist) {
            setSelectedTemplate(data.checklist);
            setView('run');
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleRun = (template: Template) => {
    setSelectedTemplate(template);
    setAnswers({});
    setMetadata({});
    setObservations('');
    setPhotos({});
    setSignature('');
    setConfirmedAt(null);
    setView('run');
  };

  const handleSave = (saved: Template) => {
    setTemplates((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      if (exists) return prev.map((t) => (t.id === saved.id ? saved : t));
      return [...prev, saved];
    });
    setEditingTemplate(null);
    setView('home');
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setView('templates');
  };

  const handleDelete = (template: Template) => {
    setDeleteTarget(template);
  };

  const confirmDeleteTemplate = async () => {
    const template = deleteTarget;
    setDeleteTarget(null);
    if (!template) return;

    try {
      const res = await fetch(`/api/checklists/${template.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch {
      alert('Erro ao excluir modelo.');
    }
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setView('templates');
  };

  const handleFinish = (data: {
    answers: Record<string, string[]>;
    metadata: Record<string, string>;
    observations: string;
    photos: Record<string, File[]>;
    signature: string;
    confirmedAt: string;
  }) => {
    setAnswers(data.answers);
    setMetadata(data.metadata);
    setObservations(data.observations);
    setPhotos(data.photos);
    setSignature(data.signature);
    setConfirmedAt(data.confirmedAt);
    setView('report');
  };

  const headerById = new Map(headers.map((h) => [h.id, h]));

  return (
    <AppShell
      view={view}
      onNavigate={setView}
      onRun={handleRun}
      templates={templates}
      setTemplates={setTemplates}
    >
      {view === 'home' && (
        <Dashboard
          templates={templates}
          onRun={handleRun}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNew={handleNew}
        />
      )}
      {view === 'templates' && (
        <TemplateEditor
          key={editingTemplate?.id || 'new'}
          initial={editingTemplate || undefined}
          onSave={handleSave}
          onCancel={() => { setEditingTemplate(null); setView('home'); }}
        />
      )}
      {view === 'run' && selectedTemplate && (
        <ChecklistRunner
          template={selectedTemplate}
          header={selectedTemplate.headerId ? headerById.get(selectedTemplate.headerId) : undefined}
          initialAnswers={answers}
          initialMetadata={metadata}
          initialObservations={observations}
          initialPhotos={photos}
          onFinish={handleFinish}
          onBack={() => setView('home')}
        />
      )}
      {view === 'report' && selectedTemplate && (
        <ReportReview
          template={selectedTemplate}
          header={selectedTemplate.headerId ? headerById.get(selectedTemplate.headerId) : undefined}
          answers={answers}
          metadata={metadata}
          observations={observations}
          photos={photos}
          signature={signature}
          confirmedAt={confirmedAt!}
          onBack={() => setView('run')}
        />
      )}
      {view === 'history' && <ResponseHistory templates={templates} headers={headers} />}
      {view === 'headers' && <HeadersView headers={headers} onHeadersChanged={loadHeaders} />}
      {view === 'settings' && <SettingsView />}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir modelo"
        description={`O modelo "${deleteTarget?.title || ''}" será removido permanentemente.`}
        confirmPhrase={CONFIRM_DELETE_PHRASE}
        confirmLabel="Excluir"
        onConfirm={confirmDeleteTemplate}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}
