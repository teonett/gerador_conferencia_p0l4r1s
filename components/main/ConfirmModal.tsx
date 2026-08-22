import { useEffect, useState } from 'react';
import { COLORS } from '../../domain/constants';

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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(24, 54, 47, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
        {description && (
          <p style={{ marginTop: 8, fontSize: 14, color: '#555' }}>{description}</p>
        )}
        <p style={{ marginTop: 12, fontSize: 13 }}>
          Para confirmar, digite <strong>{confirmPhrase}</strong>:
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={confirmPhrase}
          autoFocus
          style={{ marginTop: 6, fontFamily: 'monospace' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button className="secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="primary"
            disabled={!matches}
            onClick={() => {
              onConfirm();
              setTyped('');
            }}
            style={!matches ? { background: '#9aa7a2', borderColor: '#9aa7a2' } : { background: COLORS.orange, borderColor: COLORS.orange }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
