import { useState, useEffect, useRef } from 'react';
import type { Template, Item, View } from '../domain/checklist';
import type { HeaderModel } from '../domain/header';
import { CONFIRM_DELETE_PHRASE } from '../domain/constants';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../components/dashboard/Dashboard';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { ChecklistRunner } from '../components/runner/ChecklistRunner';
import { ReportReview } from '../components/report/ReportReview';
import { ResponseHistory } from '../components/history/ResponseHistory';
import type { HistoryItem } from '../components/history/ResponseHistory';
import { SettingsView } from '../components/settings/SettingsView';
import { ConfirmModal } from '../components/main/ConfirmModal';
import { HeadersView } from '../components/headers/HeadersView';
import { getDraft, saveDraft, clearDraft } from '../lib/draft';

type PhotoFile = File & { r2Key?: string };

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
  const [itemObservations, setItemObservations] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, File[]>>({});
  const [extraItems, setExtraItems] = useState<Item[]>([]);
  const [signature, setSignature] = useState('');
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [headers, setHeaders] = useState<HeaderModel[]>([]);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const runTemplateRef = useRef<string | null>(null);

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
        const payload = data as { checklists?: Template[] };
        if (payload.checklists) setTemplates(payload.checklists);
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('checklist');
    if (shareToken) {
      fetch(`/api/checklists?share=${shareToken}`)
        .then((res) => res.json())
        .then((data) => {
          const payload = data as { checklist?: Template };
          if (payload.checklist) {
            setSelectedTemplate(payload.checklist);
            setView('run');
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleRun = (template: Template) => {
    runTemplateRef.current = template.id;
    setSelectedTemplate(template);
    setAnswers({});
    setMetadata({});
    setItemObservations({});
    setPhotos({});
    setExtraItems([]);
    setSignature('');
    setConfirmedAt(null);
    setIsEditing(false);
    setEditingResponseId(null);
    setDraftReady(false);
    setView('run');

    getDraft(template.id)
      .then((draft) => {
        if (runTemplateRef.current !== template.id || !draft) return;
        const restoredPhotos: Record<string, PhotoFile[]> = {};
        for (const [itemId, blobs] of Object.entries(draft.photos || {})) {
          restoredPhotos[itemId] = blobs.map(
            (blob) =>
              new File([blob], 'foto.jpg', {
                type: blob.type || 'image/jpeg',
              }) as PhotoFile
          );
        }
        setAnswers(draft.answers || {});
        setMetadata(draft.metadata || {});
        setItemObservations(draft.itemObservations || {});
        setPhotos(restoredPhotos);
        setExtraItems(draft.extraItems || []);
      })
      .catch(() => {})
      .finally(() => {
        if (runTemplateRef.current === template.id) setDraftReady(true);
      });
  };

  const handleRestart = () => {
    if (!selectedTemplate) return;
    clearDraft(selectedTemplate.id).catch(() => {});
    setAnswers({});
    setMetadata({});
    setItemObservations({});
    setPhotos({});
    setExtraItems([]);
    setSignature('');
    setConfirmedAt(null);
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
    itemObservations: Record<string, string>;
    photos: Record<string, File[]>;
    signature: string;
    confirmedAt: string;
    extraItems: Item[];
  }) => {
    if (selectedTemplate) clearDraft(selectedTemplate.id).catch(() => {});
    setAnswers(data.answers);
    setMetadata(data.metadata);
    setItemObservations(data.itemObservations);
    setPhotos(data.photos);
    setExtraItems(data.extraItems);
    setSignature(data.signature);
    setConfirmedAt(data.confirmedAt);
    setView('report');
  };

  useEffect(() => {
    if (view !== 'run' || !selectedTemplate || isEditing || !draftReady) return;
    const timer = setTimeout(() => {
      saveDraft({
        templateId: selectedTemplate.id,
        savedAt: Date.now(),
        answers,
        metadata,
        itemObservations,
        photos,
        extraItems,
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [view, selectedTemplate, answers, metadata, itemObservations, photos, extraItems, isEditing, draftReady]);

  const handleEditResponse = async (item: HistoryItem) => {
    const template = templates.find((t) => t.id === item.checklistId);
    if (!template) return;

    const r2photos: Record<string, PhotoFile[]> = {};
    for (const [itemId, keys] of Object.entries(item.photos || {})) {
      const files: PhotoFile[] = [];
      for (const key of keys) {
        const res = await fetch(`/api/files/${key}`).catch(() => null);
        if (!res || !res.ok) continue;
        const blob = await res.blob().catch(() => null);
        if (!blob) continue;
        const file = new File([blob], 'foto.jpg', {
          type: blob.type || 'image/jpeg',
        }) as PhotoFile;
        file.r2Key = key;
        files.push(file);
      }
      if (files.length > 0) r2photos[itemId] = files;
    }

    runTemplateRef.current = template.id;
    setSelectedTemplate(template);
    setAnswers(item.answers);
    setMetadata(item.metadata || {});
    setItemObservations(item.itemObservations || {});
    setPhotos(r2photos);
    setExtraItems(item.extraItems || []);
    setSignature(item.signatureName || '');
    setConfirmedAt(new Date(item.completedAt).toISOString());
    setEditingResponseId(item.id);
    setIsEditing(true);
    setDraftReady(false);
    setView('run');
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
          initialObservations={itemObservations}
          initialPhotos={photos}
          initialExtraItems={extraItems}
          onFinish={handleFinish}
          onBack={() => {
            setIsEditing(false);
            setEditingResponseId(null);
            setView(isEditing ? 'history' : 'home');
          }}
          onRestart={handleRestart}
        />
      )}
      {view === 'report' && selectedTemplate && (
        <ReportReview
          template={selectedTemplate}
          header={selectedTemplate.headerId ? headerById.get(selectedTemplate.headerId) : undefined}
          answers={answers}
          metadata={metadata}
          itemObservations={itemObservations}
          photos={photos as Record<string, PhotoFile[]>}
          signature={signature}
          confirmedAt={confirmedAt!}
          extraItems={extraItems}
          editMode={isEditing}
          responseId={editingResponseId || undefined}
          onBack={() => setView('run')}
          onSaved={() => {
            setIsEditing(false);
            setEditingResponseId(null);
            setView('history');
          }}
        />
      )}
      {view === 'history' && <ResponseHistory templates={templates} headers={headers} onEdit={handleEditResponse} />}
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
