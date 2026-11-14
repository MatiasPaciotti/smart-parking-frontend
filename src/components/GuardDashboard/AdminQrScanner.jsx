import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, QrCode, ScanLine, X } from 'lucide-react';
import { scanParkingQr } from '../../services/entryQrService';

function cameraErrorMessage(error) {
  if (typeof window === 'undefined' || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return 'La cámara requiere HTTPS y permiso del navegador.';
  }
  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
    return 'Permití el acceso a la cámara en los permisos del navegador.';
  }
  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
    return 'No se encontró una cámara disponible en este dispositivo.';
  }
  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
    return 'La cámara está ocupada por otra aplicación. Cerrala e intentá nuevamente.';
  }
  if (error === false) {
    return 'El navegador no pudo iniciar la vista previa. Abrí el sitio directamente en Safari (iPhone) o Chrome (Android) y volvé a intentar.';
  }
  const details = [error?.name, error?.message].filter(Boolean).join(': ')
    || (typeof error === 'string' ? error : '');
  return details
    ? `No se pudo abrir la cámara (${details}).`
    : 'No se pudo abrir la cámara.';
}

export default function AdminQrScanner({ onEntryRegistered }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const controlsRef = useRef(null);
  const sessionRef = useRef(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [scanError, setScanError] = useState('');
  const [result, setResult] = useState(null);

  const supportsCamera = typeof window !== 'undefined'
    && window.isSecureContext
    && typeof navigator !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia);

  const processCode = useCallback(async (code) => {
    const qrToken = code.trim();
    if (!qrToken) {
      setScanError('Ingresá el contenido del QR para validarlo.');
      setResult(null);
      return;
    }
    setChecking(true);
    setScanError('');
    setResult(null);
    try {
      const entry = await scanParkingQr(qrToken);
      setResult(entry);
      setManualCode('');
      await onEntryRegistered?.(entry);
    } catch (error) {
      setScanError(error.message || 'No se pudo registrar el ingreso.');
    } finally {
      setChecking(false);
    }
  }, [onEntryRegistered]);

  const stopCamera = useCallback(() => {
    sessionRef.current += 1;
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScannerOpen(false);
  }, []);

  useEffect(() => () => {
    sessionRef.current += 1;
    controlsRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startCamera = useCallback(async () => {
    setScanError('');
    setResult(null);
    if (!supportsCamera) {
      setScanError(cameraErrorMessage());
      return;
    }
    const session = sessionRef.current + 1;
    sessionRef.current = session;
    setScannerOpen(true);
    let stream;
    let video;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      video = videoRef.current || await new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve(videoRef.current));
      });
      if (!video) throw new Error('No se pudo iniciar la vista previa.');

      video.muted = true;
      video.playsInline = true;
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.srcObject = stream;
      await video.play();

      const { BrowserQRCodeReader } = await import('@zxing/browser');
      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoElement(video, (decoded, error, activeControls) => {
        if (decoded && session === sessionRef.current) {
          sessionRef.current += 1;
          activeControls?.stop();
          stream.getTracks().forEach((track) => track.stop());
          controlsRef.current = null;
          streamRef.current = null;
          setScannerOpen(false);
          processCode(decoded.getText());
          return;
        }
        const normalDecodeErrors = ['NotFoundException', 'ChecksumException', 'FormatException'];
        if (error && !normalDecodeErrors.includes(error.name) && session === sessionRef.current) {
          sessionRef.current += 1;
          activeControls?.stop();
          stream.getTracks().forEach((track) => track.stop());
          controlsRef.current = null;
          streamRef.current = null;
          console.error('Error al decodificar QR desde la cámara:', error);
          setScanError(cameraErrorMessage(error));
          setScannerOpen(false);
        }
      });

      if (session === sessionRef.current) controlsRef.current = controls;
      else controls.stop();
    } catch (error) {
      console.error('Error al iniciar el escáner QR:', error);
      stream?.getTracks().forEach((track) => track.stop());
      if (video?.srcObject === stream) video.srcObject = null;
      streamRef.current = null;
      controlsRef.current = null;
      if (session === sessionRef.current) {
        setScanError(cameraErrorMessage(error));
        setScannerOpen(false);
      }
    }
  }, [processCode, supportsCamera]);

  return (
    <section className="flex h-full w-full flex-col rounded-3xl border border-slate-800/80 bg-[#0d1527]/90 p-4 text-white shadow-2xl backdrop-blur-md sm:p-5">
      <header className="mb-4 flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <QrCode className="h-5 w-5 shrink-0 text-cyan-400" />
          <h2 className="truncate font-outfit text-sm font-bold sm:text-base">Escanear QR</h2>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400">ACTIVO</span>
      </header>

      <div className="flex min-h-56 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-500/30 bg-[#070e1c]/70 p-3 sm:min-h-64">
        {scannerOpen ? (
          <div className="w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-black">
            <video ref={videoRef} className="aspect-video w-full object-cover" autoPlay muted playsInline />
            <p className="bg-slate-950 px-3 py-2 text-center text-xs text-slate-300">Centrá el QR dentro del cuadro</p>
          </div>
        ) : result ? (
          <div className="w-full rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-emerald-200">{result.event_type === "exit" ? "Egreso registrado" : "Ingreso registrado"}</p>
                <p className="mt-1 text-xs text-slate-300">{result.message}</p>
                <div className="mt-3 break-all border-t border-emerald-500/15 pt-3 text-xs text-slate-300">
                  {result.full_name && <p className="font-semibold text-white">{result.full_name}</p>}
                  {result.plate && <p className="mt-1">Patente: {result.plate}</p>}
                  {Number.isFinite(result.occupied) && Number.isFinite(result.capacity) && (
                    <p className="mt-2 text-emerald-200">Ocupación: {result.occupied} / {result.capacity}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : scanError ? (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
            <CircleAlert className="h-5 w-5 shrink-0 text-rose-300" />
            <p className="text-xs leading-relaxed">{scanError}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-cyan-950/70 text-cyan-400 sm:h-32 sm:w-32">
              <ScanLine className="h-12 w-12 stroke-[1.3]" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => (scannerOpen ? stopCamera() : startCamera())}
          disabled={checking}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-700 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-sm sm:text-sm"
        >
          {scannerOpen ? <X className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
          {scannerOpen ? 'DETENER ESCANEO' : 'ESCANEAR QR'}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={(event) => setManualCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') processCode(manualCode);
          }}
          placeholder="Ingresa el código manualmente"
          aria-label="Código QR manual"
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500"
        />
        <button
          type="button"
          onClick={() => processCode(manualCode)}
          disabled={checking}
          className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-700 px-3 py-2.5 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50 sm:px-4"
        >
          {checking ? '...' : 'Procesar'}
        </button>
      </div>
      {checking && <p className="mt-2 animate-pulse text-center text-[11px] text-cyan-300">Registrando movimiento…</p>}
    </section>
  );
}
