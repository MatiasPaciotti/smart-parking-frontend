import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setRegisterSuccess } from '../../store/slices/authSlice';
import { getUserProfile } from '../../services/authService';
import { getParkingLots, getParkingLotOccupancy } from '../../services/parkingLotService';
import ParkingLotSelector from '../common/ParkingLotSelector';
import OccupancyCard from '../common/OccupancyCard';
import AdminQrScanner from './AdminQrScanner';
import logo from '../../assets/logo.webp';

export default function GuardDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token: reduxToken } = useSelector((state) => state.auth);
  const token = reduxToken || localStorage.getItem('token');

  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(() => (
    localStorage.getItem('preferred_parking_lot_id') || ''
  ));
  const [loadingLots, setLoadingLots] = useState(true);
  const [occupancyData, setOccupancyData] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (user?.full_name) return undefined;
    const loadProfile = async () => {
      if (!token) return;
      try {
        const profile = await getUserProfile();
        if (!cancelled) dispatch(setRegisterSuccess(profile));
      } catch (error) {
        console.error('Error al cargar el perfil:', error.message);
      }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, [dispatch, token, user]);

  useEffect(() => {
    let cancelled = false;
    const loadParkingLots = async () => {
      try {
        const data = await getParkingLots();
        if (cancelled) return;
        const lotsList = data?.parking_lots || [];
        setParkingLots(lotsList);
        const savedLotId = localStorage.getItem('preferred_parking_lot_id');
        if (!savedLotId && lotsList.length > 0) {
          const defaultId = data.default_parking_lot_id || lotsList[0].id;
          setSelectedLotId(defaultId);
          localStorage.setItem('preferred_parking_lot_id', defaultId);
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
  }, [fetchOccupancy, selectedLotId]);

  const handleLotChange = (newLotId) => {
    setSelectedLotId(newLotId);
    localStorage.setItem('preferred_parking_lot_id', newLotId);
  };

  const handleEntryRegistered = useCallback((entry) => {
    const lotId = entry?.parking_lot_id || selectedLotId;
    if (lotId && lotId !== selectedLotId) {
      setSelectedLotId(lotId);
      localStorage.setItem('preferred_parking_lot_id', lotId);
    }
    fetchOccupancy(lotId);
  }, [fetchOccupancy, selectedLotId]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex w-full flex-col items-center px-4 py-3 font-inter text-white sm:px-6 md:py-4">
      <div className="w-full max-w-md space-y-6 md:max-w-6xl">
        <div className="hidden justify-center pt-1 md:flex">
          <img src={logo} alt="SmartParking UNSAM" className="h-20 w-auto object-contain md:h-24" />
        </div>
        <div className="flex w-full flex-col items-start gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-400">Panel de guardia</p>
            <h1 className="break-words font-outfit text-xl font-bold text-white sm:text-2xl md:text-3xl">
              ¡Hola, {user?.full_name || 'Personal de Seguridad'}!
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 cursor-pointer self-start rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-white sm:self-auto"
          >
            Cerrar Sesión
          </button>
        </div>
        <div className="w-full">
          <ParkingLotSelector
            lots={parkingLots}
            selectedLotId={selectedLotId}
            onChange={handleLotChange}
            disabled={loadingLots}
          />
        </div>
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          <OccupancyCard
            className="h-full"
            occupancyData={occupancyData}
            loading={loadingOccupancy}
            onRefresh={() => fetchOccupancy(selectedLotId)}
          />
          <AdminQrScanner onEntryRegistered={handleEntryRegistered} />
        </div>
      </div>
    </div>
  );
}
