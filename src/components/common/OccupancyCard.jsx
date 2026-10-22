import React from 'react';
import { Activity, RotateCw } from 'lucide-react';

export default function OccupancyCard({ occupancyData, loading = false, onRefresh, className = '' }) {
  if (loading && !occupancyData) {
    return (
      <div className={`w-full bg-[#0d1527] border border-slate-800 rounded-3xl p-5 shadow-xl animate-pulse space-y-4 ${className}`}>
        <div className="h-6 bg-slate-800 rounded w-2/3"></div>
        <div className="h-32 bg-slate-800 rounded-2xl w-full"></div>
        <div className="h-4 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (!occupancyData) {
    return (
      <div className="w-full bg-[#0d1527] border border-slate-800 rounded-3xl p-5 text-center text-slate-400 text-xs">
        No hay datos de ocupación disponibles
      </div>
    );
  }

  const {
    capacity = 0,
    occupied = 0,
    available = 0,
    occupancy_percentage = 0,
    traffic_light = 'green',
  } = occupancyData;

  const getTrafficLightConfig = (light) => {
    switch (light) {
      case 'red':
        return {
          strokeColor: '#ef4444',
          dotBg: 'bg-rose-500',
          text: 'Estacionamiento Lleno',
          progressBg: 'bg-rose-500',
        };
      case 'yellow':
        return {
          strokeColor: '#eab308',
          dotBg: 'bg-amber-400',
          text: 'Disponibilidad Media',
          progressBg: 'bg-amber-400',
        };
      case 'green':
      default:
        return {
          strokeColor: '#10b981',
          dotBg: 'bg-emerald-400',
          text: 'Disponibilidad Alta',
          progressBg: 'bg-emerald-400',
        };
    }
  };

  const lightConfig = getTrafficLightConfig(traffic_light);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancy_percentage / 100) * circumference;

  return (
    <div className={`w-full bg-[#0d1527] border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl text-white font-inter ${className}`}>
      
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-5 h-5 text-slate-300 shrink-0" />
          <h3 className="text-sm sm:text-base font-bold font-outfit text-white leading-tight">
            Ocupación
          </h3>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          title="Actualizar datos de ocupación"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border border-emerald-500/30 shrink-0 transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RotateCw className={`w-3 h-3 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'CARGANDO...' : 'ACTUALIZAR'}</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center mb-5">
        
        <div className="col-span-5 flex items-center justify-center relative">
          <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-800/90"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={lightConfig.strokeColor}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-xl sm:text-2xl font-extrabold font-outfit text-white tracking-tight">
            {Math.round(occupancy_percentage)}%
          </span>
        </div>

        <div className="col-span-7 space-y-2">
          <div className="flex items-center justify-between gap-1 bg-[#141d2e] border border-slate-800/80 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl">
            <span className="text-xs sm:text-base font-bold text-white font-outfit shrink-0">{available}</span>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate">Lugares libres</span>
          </div>

          <div className="flex items-center justify-between gap-1 bg-[#141d2e] border border-slate-800/80 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl">
            <span className="text-xs sm:text-base font-bold text-white font-outfit shrink-0">{occupied}</span>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate">Ocupados</span>
          </div>

          <div className="flex items-center justify-between gap-1 bg-[#141d2e] border border-slate-800/80 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl">
            <span className="text-xs sm:text-base font-bold text-white font-outfit shrink-0">{capacity}</span>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate">Capacidad total</span>
          </div>
        </div>

      </div>

      <div className="space-y-2">
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${lightConfig.progressBg}`}
            style={{ width: `${Math.min(occupancy_percentage, 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-0.5">
          <span>0</span>
          <div className="flex items-center gap-1.5 font-medium">
            <span>{lightConfig.text}</span>
            <span className={`w-2 h-2 rounded-full ${lightConfig.dotBg} animate-pulse`}></span>
          </div>
          <span>{capacity}</span>
        </div>
      </div>

    </div>
  );
}