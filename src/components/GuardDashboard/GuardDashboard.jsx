import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setRegisterSuccess } from '../../store/slices/authSlice';
import { getUserProfile } from '../../services/authService';
import { getParkingLots, getParkingLotOccupancy } from '../../services/parkingLotService';
import ParkingLotSelector from '../common/ParkingLotSelector';
import OccupancyCard from '../common/OccupancyCard';
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

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="w-full text-white font-inter px-4 py-3 sm:px-6 md:py-4 flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-5xl space-y-6">
        <div className="hidden md:flex justify-center pt-1">
          <img
            src={logo}
            alt="SmartParking UNSAM"
            className="h-20 md:h-24 w-auto object-contain"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-400">
              Panel de guardia
            </p>
            <h1 className="break-words font-outfit text-xl font-bold text-white sm:text-2xl md:text-3xl">
              ¡Hola, {user?.full_name || 'Personal de Seguridad'}!
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 cursor-pointer self-start rounded-xl border sm:self-auto border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
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
          <div className="w-full min-w-0">
            <OccupancyCard
              occupancyData={occupancyData}
              loading={loadingOccupancy}
              onRefresh={() => fetchOccupancy(selectedLotId)}
            />
          </div>

          <div className="w-full min-w-0">
            <div className="flex h-full w-full flex-col justify-between space-y-3 rounded-3xl border border-slate-800/80 bg-[#0d1527]/90 p-4 shadow-2xl backdrop-blur-md sm:p-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400 sm:text-xs">
                    Información de cuenta
                  </span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 sm:text-xs">
                    ACTIVA
                  </span>
                </div>

                <div className="flex flex-col items-center py-1 text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10 sm:h-14 sm:w-14">
                    <span className="font-outfit text-lg font-bold text-sky-400 sm:text-xl">
                      {(user?.full_name || user?.email || 'G').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-outfit text-sm font-bold text-white sm:text-base">
                    {user?.full_name || 'Personal de Seguridad'}
                  </h2>
                  {user?.email && (
                    <p className="mt-0.5 break-all text-xs text-slate-400">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/60 pt-2">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-800/40 px-3 py-1.5">
                  <span className="text-xs text-slate-400">Rol activo</span>
                  <span className="text-xs font-medium capitalize text-sky-400">
                    {user?.role || 'guardia'}
                  </span>
                </div>
                {user?.dni && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-800/40 px-3 py-1.5">
                    <span className="text-xs text-slate-400">DNI</span>
                    <span className="font-mono text-xs font-medium text-white">{user.dni}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-800/40 px-3 py-1.5">
                  <span className="text-xs text-slate-400">Estado</span>
                  <span className="text-xs font-medium text-emerald-400">Cuenta activa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

