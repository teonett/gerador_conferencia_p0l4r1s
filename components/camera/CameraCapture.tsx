import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../../domain/constants';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const stopStream = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const start = async () => {
      setError('');
      stopStream();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) {
          setError('Não foi possível acessar a câmera. Verifique a permissão do navegador.');
        }
      }
    };

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facingMode]);

  const handleShoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.9
    );
  };

  const actionButtonStyle = {
    padding: '10px 20px',
    borderRadius: 8,
    border: `1px solid ${COLORS.line}`,
  } as const;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 16,
      }}
    >
      {error ? (
        <p style={{ color: 'white', fontSize: 14, textAlign: 'center', maxWidth: 320 }}>{error}</p>
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12, background: 'black' }}
        />
      )}
      <div style={{ display: 'flex', gap: 16 }}>
        <button className="secondary" onClick={onClose} style={actionButtonStyle}>
          ✕ Fechar
        </button>
        {!error && (
          <>
            <button className="primary" onClick={handleShoot} style={actionButtonStyle}>
              📷 Capturar
            </button>
            <button
              className="secondary"
              onClick={() =>
                setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))
              }
              style={actionButtonStyle}
            >
              🔄
            </button>
          </>
        )}
      </div>
    </div>
  );
}
