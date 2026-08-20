'use client';

import { useState, useEffect } from 'react';
import type { Template } from '../domain/checklist';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../components/dashboard/Dashboard';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { ChecklistRunner } from '../components/runner/ChecklistRunner';
import { ReportReview } from '../components/report/ReportReview';

export default function Home() {
  const [view, setView] = useState<'home' | 'templates' | 'run' | 'report'>('home');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState('');
  const [signature, setSignature] = useState('');
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  useEffect(() => {
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
          onNew={() => setView('templates')}
        />
      )}
      {view === 'templates' && (
        <TemplateEditor
          onSave={handleSave}
          onCancel={() => setView('home')}
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
