import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

export default function GuardDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="w-full rounded-[28px] bg-[#0d1527]/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-md text-white font-inter">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <h1 className="text-xl font-bold font-outfit text-white">Dashboard Guardia</h1>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>
      <p className="text-sm text-slate-400">
        Bienvenido: <span className="text-white font-semibold">{user?.full_name || user?.email || 'Personal de Seguridad'}</span>
      </p>
      <p className="text-xs text-sky-400 mt-2">Rol activo: {user?.role || 'guard'}</p>
    </div>
  );
}