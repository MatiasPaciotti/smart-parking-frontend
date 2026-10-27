import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { getParkingLots, getParkingLotOccupancy } from '../../services/parkingLotService';
import ParkingLotSelector from '../common/ParkingLotSelector';
import OccupancyCard from '../common/OccupancyCard';

export default function GuardDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(() => localStorage.getItem('preferred_parking_lot_id') || '');
  const [loadingLots, setLoadingLots] = useState(true);
  const [occupancyData, setOccupancyData] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadParkingLots = async () => {
      try {
        const data = await getParkingLots();
        if (!cancelled) {
          const lotsList = data?.parking_lots || [];
          setParkingLots(lotsList);
          const savedLotId = localStorage.getItem('preferred_parking_lot_id');
          if (!savedLotId && lotsList.length > 0) {
            const defaultId = data.default_parking_lot_id || lotsList[0].id;
            setSelectedLotId(defaultId);
            localStorage.setItem('preferred_parking_lot_id', defaultId);
          }
        }
      } catch (error) {
        console.error('Error al cargar los estacionamientos:', error);
      } finally {
        if (!cancelled) setLoadingLots(false);
      }
    };
    loadParkingLots();
    return () => { cancelled = true; };
  }, []);

  const fetchOccupancy = useCallback(async (lotId) => {
    const targetLotId = lotId || selectedLotId;
    if (!targetLotId) return;
    setLoadingOccupancy(true);
    try {
      setOccupancyData(await getParkingLotOccupancy(targetLotId));
    } catch (error) {
      console.error('Error al consultar la ocupación desde el backend:', error);
      setOccupancyData(null);
    } finally {
      setLoadingOccupancy(false);
    }
  }, [selectedLotId]);

  useEffect(() => {
    if (selectedLotId) fetchOccupancy(selectedLotId);
  }, [selectedLotId, fetchOccupancy]);

  const handleLotChange = (newLotId) => {
    setSelectedLotId(newLotId);
    localStorage.setItem('preferred_parking_lot_id', newLotId);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="w-full max-w-5xl rounded-[28px] bg-[#0d1527]/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-md text-white font-inter">
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
      <div className="mt-6">
        <ParkingLotSelector
          lots={parkingLots}
          selectedLotId={selectedLotId}
          onChange={handleLotChange}
          disabled={loadingLots}
        />
      </div>
      <div className="mt-4 max-w-xl">
        <OccupancyCard
          occupancyData={occupancyData}
          loading={loadingOccupancy}
          onRefresh={() => fetchOccupancy(selectedLotId)}
        />
      </div>
    </div>
  );
}
