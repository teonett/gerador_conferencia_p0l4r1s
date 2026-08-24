import { useEffect, useState } from 'react';
import { BTN_DANGER, BTN_PRIMARY, INPUT } from '../ui/classes';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmPhrase: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmPhrase,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  const matches = typed === confirmPhrase;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 bg-black/55 flex items-center justify-center z-[1000] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="bg-surface rounded-xl p-6 w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
        <p className="mt-3 text-[13px]">
          Para confirmar, digite <strong>{confirmPhrase}</strong>:
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={confirmPhrase}
          autoFocus
          className={`${INPUT} mt-1.5 font-mono`}
        />
        <div className="flex justify-end gap-2 mt-5">
          <button className={BTN_PRIMARY} onClick={onCancel}>
            Cancelar
          </button>
          <button
            disabled={!matches}
            onClick={() => {
              onConfirm();
              setTyped('');
            }}
            className={
              matches
                ? BTN_DANGER
                : 'cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium bg-[#9aa7a2] text-white border border-[#9aa7a2]'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
