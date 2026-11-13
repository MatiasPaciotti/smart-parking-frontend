import React from 'react';
import { createPortal } from 'react-dom';

export default function RemoveGuestModal({
  plate,
  error = '',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-guest-title"
        aria-describedby="remove-guest-description"
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0d1527] p-5 shadow-2xl"
      >
        <h2 id="remove-guest-title" className="font-outfit text-base font-bold text-white cursor-pointer">
          Quitar vehículo
        </h2>
        <p id="remove-guest-description" className="mt-2 text-sm text-slate-300">
          ¿Querés quitar la patente <span className="font-mono font-semibold text-white">{plate}</span> del estacionamiento?
        </p>
        {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition-colors cursor-pointer hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300 transition-colors cursor-pointer hover:bg-rose-500/20 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? 'Quitando...' : 'Quitar'}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}