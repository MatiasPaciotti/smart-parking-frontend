import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import logo from '../../assets/logo.webp';
import { getParkingLots, getParkingLotOccupancy } from '../../services/parkingLotService';
import ParkingLotSelector from '../common/ParkingLotSelector';
import OccupancyCard from '../common/OccupancyCard';

export default function GuardDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(
    () => localStorage.getItem('preferred_parking_lot_id') || ''
  );
  const [loadingLots, setLoadingLots] = useState(true);
  const [occupancyData, setOccupancyData] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);
  const [occupancyError, setOccupancyError] = useState('');
  const selectedLotRef = useRef(selectedLotId);
  selectedLotRef.current = selectedLotId;

  const fetchOccupancy = useCallback(async (lotId, showLoading = false) => {
    if (!lotId) return;
    if (showLoading) setLoadingOccupancy(true);
    try {
      const data = await getParkingLotOccupancy(lotId);
      // Ignore a late response if the guard has already selected another lot.
      if (selectedLotRef.current === lotId) {
        setOccupancyData(data);
        setOccupancyError('');
      }
    } catch (error) {
      setOccupancyError(error.message || 'No se pudo consultar la ocupación.');
    } finally {
      if (showLoading) setLoadingOccupancy(false);
    }
  }, [selectedLotId]);

  useEffect(() => {
    let cancelled = false;
    async function loadLots() {
      try {
        const data = await getParkingLots();
        if (cancelled) return;
        const lots = data.parking_lots || [];
        setParkingLots(lots);
        const savedId = localStorage.getItem('preferred_parking_lot_id');
        const validSavedId = lots.some((lot) => lot.id === savedId);
        const initialId = validSavedId ? savedId : (data.default_parking_lot_id || lots[0]?.id || '');
        setSelectedLotId(initialId);
        if (initialId) localStorage.setItem('preferred_parking_lot_id', initialId);
      } catch (error) {
        if (!cancelled) setOccupancyError(error.message || 'No se pudieron cargar los estacionamientos.');
      } finally {
        if (!cancelled) setLoadingLots(false);
      }
    }
    loadLots();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedLotId) return undefined;
    setOccupancyData(null);
    fetchOccupancy(selectedLotId, true);

    // Polling keeps the guard panel current when another terminal records a movement.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') fetchOccupancy(selectedLotId);
    }, 90000);

    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') fetchOccupancy(selectedLotId);
    };
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [selectedLotId, fetchOccupancy]);

  const handleLotChange = (lotId) => {
    selectedLotRef.current = lotId;
    setSelectedLotId(lotId);
    localStorage.setItem('preferred_parking_lot_id', lotId);
    setOccupancyData(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:px-6 text-white font-inter">
      <section className="w-full rounded-[28px] bg-[#0d1527]/90 border border-slate-800/80 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="SmartParking UNSAM" className="h-12 w-auto object-contain shrink-0" />
            <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold font-outfit">Dashboard de administración</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Estado y capacidad de los estacionamientos en tiempo real</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        <p className="text-sm text-slate-300 mb-4">
          Administrador: <span className="text-white font-semibold">{user?.full_name || user?.email || 'Administrador'}</span>
        </p>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Estacionamiento seleccionado</label>
          <ParkingLotSelector
            lots={parkingLots}
            selectedLotId={selectedLotId}
            onChange={handleLotChange}
            disabled={loadingLots}
          />
        </div>

        {occupancyError && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {occupancyError}
          </div>
        )}

        <OccupancyCard
          occupancyData={occupancyData}
          loading={loadingOccupancy}
          onRefresh={() => fetchOccupancy(selectedLotId, true)}
          className="border-slate-700"
        />
        <p className="text-[11px] text-slate-500 mt-3 text-center">
          Los indicadores se actualizan automáticamente cada 5 segundos y al volver a esta pestaña.
        </p>
      </section>
    </div>
  );
}
