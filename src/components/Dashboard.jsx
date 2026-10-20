import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setRegisterSuccess } from '../store/slices/authSlice';
import { getUserProfile } from '../services/authService';
import { getParkingLots } from '../services/parkingLotService';
import ParkingLotSelector from './common/ParkingLotSelector';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);

  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(() => {
    return localStorage.getItem('preferred_parking_lot_id') || '';
  });
  const [loadingLots, setLoadingLots] = useState(true);

  useEffect(() => {
    let cancelled = false;

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
  }, [token, dispatch]);

  useEffect(() => {
    let cancelled = false;

    const loadParkingLots = async () => {
      try {
        const data = await getParkingLots();

        if (!cancelled) {
          const lotsList = data?.parking_lots || [];
          setParkingLots(lotsList);

          if (!selectedLotId && lotsList.length > 0) {
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

  const handleLotChange = (newLotId) => {
    setSelectedLotId(newLotId);
    localStorage.setItem('preferred_parking_lot_id', newLotId);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="mx-auto my-4 w-full max-w-[386px] rounded-[28px] bg-[#0d1527]/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-md text-white font-inter space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Dashboard</span>
            <h2 className="text-xl font-bold font-outfit">SmartParking UNSAM</h2>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>

        <ParkingLotSelector
          lots={parkingLots}
          selectedLotId={selectedLotId}
          onChange={handleLotChange}
          disabled={loadingLots}
        />

        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
          <p className="text-xs text-slate-300">Bienvenido/a</p>
          <h3 className="text-lg font-bold text-white font-outfit">{user?.full_name || 'Usuario'}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          {user?.dni && <p className="text-[11px] text-slate-500 mt-1">DNI: {user?.dni}</p>}
        </div>

      </div>
    </div>
  );
}