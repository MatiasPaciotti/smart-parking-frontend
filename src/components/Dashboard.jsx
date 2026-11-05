import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setRegisterSuccess } from '../store/slices/authSlice';
import { getUserProfile } from '../services/authService';
import { getParkingLots, getParkingLotOccupancy } from '../services/parkingLotService';
import ParkingLotSelector from './common/ParkingLotSelector';
import OccupancyCard from './common/OccupancyCard';
import logo from '../assets/logo.webp';
import { QrCode } from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token: reduxToken } = useSelector((state) => state.auth);
  const token = reduxToken || localStorage.getItem('token');

  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(() => {
    return localStorage.getItem('preferred_parking_lot_id') || '';
  });
  const [loadingLots, setLoadingLots] = useState(true);

  const [occupancyData, setOccupancyData] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (user && user.full_name && user.dni && (user.plate || user.patente)) return;

    const loadProfile = async () => {
      if (!token) return;

      try {
        const profile = await getUserProfile();
        if (!cancelled) {
          dispatch(setRegisterSuccess(profile));
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error.message);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token, dispatch, user]);

    useEffect(() => {
    let cancelled = false;
    const loadParkingLots = async () => {
      try {
        const data = await getParkingLots();
        if (!cancelled) {
          const lotsList = data?.parking_lots || [];
          setParkingLots(lotsList);
          const saved = localStorage.getItem('preferred_parking_lot_id');
          const isValid = lotsList.some((lot) => lot.id === saved);
          if (!isValid && lotsList.length > 0) {
            const defaultId = data.default_parking_lot_id || lotsList[0].id;
            setSelectedLotId(defaultId);
            localStorage.setItem('preferred_parking_lot_id', String(defaultId));
          } else if (isValid) {
            setSelectedLotId(saved);
          }
        }
      } catch (error) {
        console.error('Error al cargar los estacionamientos:', error);
      } finally {
        if (!cancelled) setLoadingLots(false);
      }
    };
    loadParkingLots();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchOccupancy = useCallback(async (lotId) => {
    const targetLotId = lotId || selectedLotId;
    if (!targetLotId) return;

    setLoadingOccupancy(true);
    try {
      const data = await getParkingLotOccupancy(targetLotId);
      setOccupancyData(data);
    } catch (error) {
      console.error('Error al consultar la ocupación desde el backend:', error);
      setOccupancyData(null);
    } finally {
      setLoadingOccupancy(false);
    }
  }, [selectedLotId]);

  useEffect(() => {
    if (selectedLotId) {
      fetchOccupancy(selectedLotId);
    }
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
    <div className="w-full text-white font-inter px-4 py-3 sm:px-6 md:py-4 flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-5xl space-y-6">

        <div className="hidden md:flex justify-center pt-1">
          <img
            src={logo}
            alt="SmartParking UNSAM"
            className="h-20 md:h-24 w-auto object-contain"
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-1 relative w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-outfit text-white md:w-full md:text-center">
            ¡Hola, {user?.full_name || 'Usuario'}!
          </h1>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <div className="w-full min-w-0 flex">
            <OccupancyCard
              className="h-full w-full"
              occupancyData={occupancyData}
              loading={loadingOccupancy}
              onRefresh={() => fetchOccupancy(selectedLotId)}
            />
          </div>
          <div className="w-full min-w-0 flex">
            <div className="w-full p-4 sm:p-5 rounded-3xl bg-[#0d1527]/90 border border-slate-800/80 shadow-2xl backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-white" />
                  <h2 className="text-sm sm:text-base font-bold text-white font-outfit">
                    Acceso al Campus
                  </h2>
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
                  user?.is_on_campus
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                }`}>
                  {user?.is_on_campus ? 'EN CAMPUS' : 'VÁLIDO'}
                </span>
              </div>
              <div className="w-full flex-1 rounded-2xl border border-dashed border-sky-500/30 bg-[#070e1c]/40 p-3 sm:p-4 flex flex-col items-center justify-between gap-2">
                <div className="flex-1 flex items-center justify-center py-2">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#082236] shadow-[0_0_10px_rgba(56,189,248,0.12)] flex items-center justify-center">
                    <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white font-outfit text-center">
                  Pase QR de Ingreso / Egreso
                </p>
                <button
                  type="button"
                  disabled={user?.is_on_campus === true}
                  onClick={() => {
                    const targetId = selectedLotId || parkingLots[0]?.id || 'rodriguez-pena';
                    localStorage.setItem('preferred_parking_lot_id', targetId);
                    navigate('/access-pass', { state: { parkingLotId: targetId } });
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-outfit font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25 ${
                    user?.is_on_campus
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  GENERAR QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}