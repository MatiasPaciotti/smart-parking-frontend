import React, { useState, useEffect, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setRegisterSuccess } from '../store/slices/authSlice';
import { getUserProfile } from '../services/authService';
import { getParkingLots, getParkingLotOccupancy } from '../services/parkingLotService';
import ParkingLotSelector from './common/ParkingLotSelector';
import OccupancyCard from './common/OccupancyCard';
import logo from '../assets/logo.webp';

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

    // Si ya tenemos la info del usuario en Redux (por ej. recién logueado), evitamos llamar al backend otra vez
    if (user && user.full_name) return;

    const loadProfile = async () => {
      if (!token) return;

      try {
        const profile = await getUserProfile();
        if (!cancelled) {
          dispatch(setRegisterSuccess(profile));
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

          // Si no hay un lote seleccionado guardado, seleccionar el por defecto
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

          <div className="w-full min-w-0">
            <OccupancyCard
              occupancyData={occupancyData}
              loading={loadingOccupancy}
              onRefresh={() => fetchOccupancy(selectedLotId)}
            />
          </div>

          <div className="w-full min-w-0">
            <div className="h-full w-full p-4 sm:p-5 rounded-3xl bg-[#0d1527]/90 border border-slate-800/80 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-3">

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] sm:text-xs text-sky-400 font-semibold uppercase tracking-wider">
                    Información de cuenta
                  </span>

                  <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    ACTIVA
                  </span>
                </div>

                <div className="flex flex-col items-center text-center py-1">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-2">
                    <span className="text-lg sm:text-xl font-bold text-sky-400 font-outfit">
                      {(user?.full_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white font-outfit">
                    {user?.full_name || 'Usuario'}
                  </h3>

                  <p className="text-xs text-slate-400 break-all mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                {user?.dni && (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/40 px-3 py-1.5 border border-slate-800/60">
                    <span className="text-xs text-slate-400">DNI</span>
                    <span className="text-xs text-white font-mono font-medium">
                      {user.dni}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/40 px-3 py-1.5 border border-slate-800/60">
                  <span className="text-xs text-slate-400">Estado</span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Cuenta activa
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}