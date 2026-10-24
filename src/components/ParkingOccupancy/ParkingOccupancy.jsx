import React, { useCallback, useEffect, useState } from 'react';
import { Activity, CarFront, CircleAlert, CircleCheck, Clock3, ParkingCircle, RefreshCw } from 'lucide-react';
import { getParkingOccupancy } from '../../services/parkingLotService';

const STATUS_STYLES = {
  green: {
    label: 'Hay disponibilidad',
    panel: 'border-emerald-500/30 bg-emerald-500/10',
    text: 'text-emerald-300',
    bar: 'bg-emerald-400',
    icon: CircleCheck,
  },
  yellow: {
    label: 'Últimos lugares disponibles',
    panel: 'border-amber-400/30 bg-amber-400/10',
    text: 'text-amber-200',
    bar: 'bg-amber-400',
    icon: CircleAlert,
  },
  red: {
    label: 'Playón completo o casi completo',
    panel: 'border-red-500/30 bg-red-500/10',
    text: 'text-red-300',
    bar: 'bg-red-500',
    icon: CircleAlert,
  },
};

export default function ParkingOccupancy({ parkingLotId, compact = false }) {
  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(Boolean(parkingLotId));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshOccupancy = useCallback(async (isInitial = false) => {
    if (!parkingLotId) {
      setOccupancy(null);
      setLoading(false);
      setError('Seleccioná un estacionamiento para ver el aforo.');
      return;
    }

    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getParkingOccupancy(parkingLotId);
      setOccupancy(data);
      setError('');
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la ocupación.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [parkingLotId]);

  useEffect(() => {
    let active = true;
    setOccupancy(null);
    setLoading(true);
    setError('');
    const load = async (initial = false) => {
      if (!active) return;
      if (initial) setLoading(true);
      try {
        if (!parkingLotId) {
          setOccupancy(null);
          setError('Seleccioná un estacionamiento para ver el aforo.');
          return;
        }
        const data = await getParkingOccupancy(parkingLotId);
        if (active) {
          setOccupancy(data);
          setError('');
          setLastUpdated(new Date());
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'No se pudo actualizar la ocupación.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load(true);
    const intervalId = window.setInterval(() => load(false), 2000);
    const handleMovement = (event) => {
      const updatedLotId = event?.detail?.parkingLotId || event?.detail?.parking_lot_id;
      if (!updatedLotId || updatedLotId === parkingLotId) load(false);
    };
    window.addEventListener('parking-occupancy-updated', handleMovement);
    window.addEventListener('parking-movement-registered', handleMovement);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('parking-occupancy-updated', handleMovement);
      window.removeEventListener('parking-movement-registered', handleMovement);
    };
  }, [parkingLotId]);

  const percentage = Math.max(0, Math.min(100, Number(occupancy?.occupancy_percentage ?? 0)));
  const status = STATUS_STYLES[occupancy?.traffic_light] || STATUS_STYLES.green;
  const StatusIcon = status.icon;

  return (
    <section className={`w-full rounded-2xl border border-slate-700/80 bg-[#0b1326]/90 p-4 sm:p-5 text-white ${compact ? 'space-y-4' : 'space-y-5'}`} aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-300">
            <ParkingCircle className="h-5 w-5" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Aforo del playón</p>
          </div>
          <h2 className="mt-1 text-lg font-bold font-outfit sm:text-xl">
            {occupancy?.parking_lot?.name ? `Estacionamiento ${occupancy.parking_lot.name}` : 'Ocupación actual'}
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs text-sky-200">
          <Activity className="h-3.5 w-3.5" />
          Actualización automática
        </div>
      </div>

      {loading && !occupancy ? (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-300"><RefreshCw className="h-4 w-4 animate-spin" /> Consultando ocupación…</div>
      ) : error && !occupancy ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : occupancy ? (
        <>
          <div className={`rounded-2xl border p-4 ${status.panel}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-slate-300">Ocupación actual</p>
                <p className={`mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl ${status.text}`}>{percentage.toLocaleString('es-AR', { maximumFractionDigits: 1 })}<span className="text-2xl">%</span></p>
              </div>
              <div className={`flex items-center gap-2 text-sm font-semibold ${status.text}`}>
                <StatusIcon className="h-5 w-5 shrink-0" />
                {status.label}
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-950/70" role="progressbar" aria-label="Porcentaje de ocupación" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
              <div className={`h-full rounded-full transition-all duration-500 ${status.bar}`} style={{ width: `${percentage}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>0% ocupado</span><span>100% capacidad</span></div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric icon={CarFront} label="Lugares ocupados" value={occupancy.occupied} detail="Vehículos dentro" />
            <Metric icon={CircleCheck} label="Lugares libres" value={occupancy.available} detail="Disponibilidad actual" />
            <Metric icon={ParkingCircle} label="Capacidad total" value={occupancy.capacity} detail="Lugares habilitados" />
          </div>

          {error && <p className="text-xs text-amber-200">No se pudo actualizar el último dato: {error}. Se conserva la última lectura disponible.</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{lastUpdated ? `Última actualización: ${lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Esperando datos'}</span>
            <button type="button" onClick={() => refreshOccupancy(false)} disabled={refreshing || !parkingLotId} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:border-sky-400/60 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar ahora
            </button>
          </div>
        </>
      ) : (
        <div className="py-5 text-sm text-slate-400">Seleccioná un estacionamiento para consultar el aforo.</div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3.5">
      <div className="flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4 text-sky-300" /><span className="text-xs">{label}</span></div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-white">{Number(value ?? 0).toLocaleString('es-AR')}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </div>
  );
}
