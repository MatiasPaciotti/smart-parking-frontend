import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setRegisterSuccess } from '../store/slices/authSlice';
import { getUserProfile } from '../services/authService';
import { getParkingLotOccupancy } from '../services/parkingLotService';
import OccupancyCard from './common/OccupancyCard';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);
  const [selectedLotId, setSelectedLotId] = useState('rodriguez-pena');
  const [occupancyData, setOccupancyData] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!token) {
        return;
      }

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
    if (!selectedLotId) return;

    let cancelled = false;

    const fetchOccupancy = async (showLoading = false) => {
      if (showLoading) setLoadingOccupancy(true);
      try {
        const data = await getParkingLotOccupancy(selectedLotId);
        if (!cancelled) {
          setOccupancyData(data);
        }
      } catch (error) {
        console.error('Error al cargar la ocupación desde la API:', error);
        if (!cancelled) {
          setOccupancyData(null);
        }
      } finally {
        if (!cancelled && showLoading) {
          setLoadingOccupancy(false);
        }
      }
    };

    fetchOccupancy(true);

    const intervalId = setInterval(() => {
      fetchOccupancy(false);
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [selectedLotId]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); 
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-6 font-inter text-white">
      <div className="w-full max-w-[420px] space-y-4 my-2">
        
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-white">
            ¡Hola, {user?.full_name || 'Usuario'}!
          </h2>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>

        <OccupancyCard
          occupancyData={occupancyData}
          loading={loadingOccupancy}
        />

        <div className="p-4 sm:p-5 rounded-3xl bg-[#0d1527] border border-slate-800/90 shadow-2xl space-y-1">
          <p className="text-xs text-slate-400">Sesión activa</p>
          <h3 className="text-base font-bold text-white font-outfit">{user?.full_name || 'Usuario'}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          {user?.dni && <p className="text-[11px] text-slate-500 pt-1">DNI: {user?.dni}</p>}
        </div>

      </div>
    </div>
  );
}