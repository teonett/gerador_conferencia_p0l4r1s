import { useEffect, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '../ui/classes';

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

  const actionButtonClass = 'px-5 py-2.5';

  return (
    <div className="fixed inset-0 z-[1000] bg-black/[0.92] flex flex-col items-center justify-center gap-4 p-4">
      {error ? (
        <p className="text-white text-sm text-center max-w-80">{error}</p>
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          className="max-w-full max-h-[70vh] rounded-xl bg-black"
        />
      )}
      <div className="flex gap-4">
        <button className={`${BTN_SECONDARY} ${actionButtonClass}`} onClick={onClose}>
          ✕ Fechar
        </button>
        {!error && (
          <>
            <button className={`${BTN_PRIMARY} ${actionButtonClass}`} onClick={handleShoot}>
              📷 Capturar
            </button>
            <button
              className={`${BTN_SECONDARY} ${actionButtonClass}`}
              onClick={() =>
                setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))
              }
            >
              🔄
            </button>
          </>
        )}
      </div>
    </div>
  );
}
