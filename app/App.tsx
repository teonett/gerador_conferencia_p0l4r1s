import { useState, useEffect } from 'react';
import type { Template } from '../domain/checklist';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../components/dashboard/Dashboard';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { ChecklistRunner } from '../components/runner/ChecklistRunner';
import { ReportReview } from '../components/report/ReportReview';

export function App() {
  const [view, setView] = useState<'home' | 'templates' | 'run' | 'report'>('home');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState('');
  const [signature, setSignature] = useState('');
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

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

  const handleDelete = async (template: Template) => {
    if (!confirm(`Excluir modelo "${template.title}"?`)) return;

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
    signature: string;
    confirmedAt: string;
  }) => {
    setAnswers(data.answers);
    setMetadata(data.metadata);
    setObservations(data.observations);
    setSignature(data.signature);
    setConfirmedAt(data.confirmedAt);
    setView('report');
  };

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
          onFinish={handleFinish}
          onBack={() => setView('home')}
        />
      )}
      {view === 'report' && selectedTemplate && (
        <ReportReview
          template={selectedTemplate}
          answers={answers}
          metadata={metadata}
          observations={observations}
          signature={signature}
          confirmedAt={confirmedAt!}
          onBack={() => setView('run')}
        />
      )}
    </AppShell>
  );
}
