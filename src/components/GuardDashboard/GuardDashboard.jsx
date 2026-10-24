import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { getParkingLots } from '../../services/parkingLotService';
import ParkingLotSelector from '../common/ParkingLotSelector';
import ParkingOccupancy from '../ParkingOccupancy/ParkingOccupancy';

export default function GuardDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(() => localStorage.getItem('preferred_parking_lot_id') || '');
  const [loadingLots, setLoadingLots] = useState(true);
  const [lotsError, setLotsError] = useState('');

  useEffect(() => {
    let active = true;
    getParkingLots()
      .then((data) => {
        if (!active) return;
        const lots = data?.parking_lots || [];
        setParkingLots(lots);
        setSelectedLotId((current) => {
          const savedExists = lots.some((lot) => lot.id === current);
          const nextId = savedExists ? current : (data.default_parking_lot_id || lots[0]?.id || '');
          if (nextId) localStorage.setItem('preferred_parking_lot_id', nextId);
          return nextId;
        });
      })
      .catch((error) => {
        if (active) setLotsError(error.message || 'No se pudieron cargar los estacionamientos.');
      })
      .finally(() => {
        if (active) setLoadingLots(false);
      });
    return () => { active = false; };
  }, []);

  const handleLotChange = (lotId) => {
    setSelectedLotId(lotId);
    localStorage.setItem('preferred_parking_lot_id', lotId);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full p-3 text-white sm:p-6">
      <div className="mx-auto my-4 w-full max-w-5xl space-y-5 rounded-[28px] border border-slate-800/80 bg-[#0d1527]/95 p-4 shadow-2xl backdrop-blur-md sm:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-2.5"><ShieldCheck className="h-6 w-6 text-sky-300" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Panel operativo</p>
              <h1 className="text-xl font-bold font-outfit sm:text-2xl">Dashboard de garita</h1>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-300">Bienvenido/a, <span className="font-semibold text-white">{user?.full_name || user?.email || 'Personal de seguridad'}</span></p>
          <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">Rol: {user?.role || 'admin'}</span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Playón asignado a esta sesión</label>
          <ParkingLotSelector
            lots={parkingLots}
            selectedLotId={selectedLotId}
            onChange={handleLotChange}
            disabled={loadingLots || parkingLots.length === 0}
          />
          {lotsError && <p className="text-xs text-red-300">{lotsError}</p>}
        </div>

        <ParkingOccupancy parkingLotId={selectedLotId} />
        <p className="text-center text-xs text-slate-500">Los datos se consultan automáticamente cada 2 segundos. También podés actualizarlos manualmente.</p>
      </div>
    </div>
  );
}
