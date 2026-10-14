import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function Dashboard({ user }) {
  const dispatch = useDispatch();

  return (
    <div className="w-full rounded-[28px] bg-[#0d1527]/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-md text-white font-inter">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Dashboard</span>
          <h2 className="text-xl font-bold font-outfit">SmartParking UNSAM</h2>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="space-y-4">
        {/* Bienvenida con datos reales devueltos por el backend */}
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
          <p className="text-xs text-slate-300">Bienvenido/a</p>
          <h3 className="text-lg font-bold text-white font-outfit">{user?.full_name || 'Usuario'}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          <p className="text-[11px] text-slate-500 mt-1">DNI: {user?.dni}</p>
        </div>

        {/* Estados iniciales según HU-01 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#162032] border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Estado de Cuenta</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.account_status === 'active' ? 'Habilitado' : user?.account_status}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#162032] border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Vehículo</span>
            <p className="text-sm font-bold text-white font-outfit">{user?.plate || 'S/D'}</p>
            <span className="text-[10px] text-slate-400">
              {user?.is_on_campus ? 'En Campus' : 'Fuera del Campus'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}