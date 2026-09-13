import type { Item } from '../domain/checklist';

export interface DraftData {
  templateId: string;
  savedAt: number;
  answers: Record<string, string[]>;
  metadata: Record<string, string>;
  observations: string;
  photos: Record<string, Blob[]>;
  extraItems: Item[];
}

const DB_NAME = 'polaris-draft';
const STORE = 'drafts';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'templateId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(
  templateId: string,
  mode: IDBTransactionMode,
  apply: (store: IDBObjectStore) => void
): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        apply(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      })
  );
}

export async function saveDraft(data: DraftData): Promise<void> {
  await transaction(data.templateId, 'readwrite', (store) => store.put(data));
}

export async function clearDraft(templateId: string): Promise<void> {
  await transaction(templateId, 'readwrite', (store) => store.delete(templateId));
}

export async function getDraft(templateId: string): Promise<DraftData | null> {
  const db = await openDb();
  return new Promise<DraftData | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(templateId);
    request.onsuccess = () => {
      db.close();
      const value = request.result as DraftData | undefined;
      resolve(value || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}