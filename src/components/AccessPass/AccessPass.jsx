import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, ArrowRight } from 'lucide-react';
import { generateAccessPass } from '../../services/accessPassService';
import { getUserProfile } from '../../services/authService';
import { setRegisterSuccess } from '../../store/slices/authSlice';

export default function AccessPass() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  const rawLotId = location.state?.parkingLotId || localStorage.getItem('preferred_parking_lot_id');
  const lotId = (rawLotId && rawLotId !== 'undefined') ? rawLotId : 'rodriguez-pena';

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        if (!user?.dni || (!user?.plate && !user?.patente)) {
          try {
            const profile = await getUserProfile();
            dispatch(setRegisterSuccess(profile));
            localStorage.setItem('user', JSON.stringify(profile));
          } catch (profileErr) {
            console.warn('No se pudo refrescar el perfil:', profileErr);
          }
        }

        const data = await generateAccessPass(lotId);
        
        if (!cancelled) {
          setPass(data);
          setSecondsLeft(data.expires_in_seconds || 300);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'No se pudo generar el pase.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    generate();
    return () => { cancelled = true; };
  }, [lotId, dispatch]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [secondsLeft > 0]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isExpired = pass && secondsLeft <= 0;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 60;

  const plate = pass?.plate || user?.plate || user?.patente || 'Sin patente';
  const dni = user?.dni;
  const getPassCode = () => {
    if (!pass?.qr_token) return '';
    const parts = pass.qr_token.split('.');
    const uniquePart = parts[2] || parts[1] || pass.qr_token;
    const chars = uniquePart.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    return `UNSAM-${chars}`;
  };
  const passCode = getPassCode();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generando pase de acceso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isTokenError = 
      error.toLowerCase().includes('token') || 
      error.toLowerCase().includes('sesión') || 
      error.toLowerCase().includes('vencido');
    const displayMessage = isTokenError
      ? `${error}. Probá cerrando sesión y volviendo a ingresar.`
      : error;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-inter">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0d1527]/90 border border-red-500/30 shadow-2xl backdrop-blur-md text-center space-y-4">
          <p className="text-red-400 font-semibold text-base sm:text-lg">
            {displayMessage}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-4 rounded-xl font-outfit font-semibold text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] cursor-pointer"
          >
            Volver al tablero
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 font-inter">
      <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-[#0a1628]/95 border border-sky-500/30 shadow-2xl backdrop-blur-md flex flex-col items-center space-y-5">
        
        <h1 className="text-xl sm:text-2xl font-bold font-outfit text-white text-center leading-tight">
          Pase de Acceso al<br />Estacionamiento
        </h1>

        <div className={`p-3 bg-white rounded-xl shadow-lg transition-opacity ${isExpired ? 'opacity-30' : ''}`}>
          <QRCodeSVG
            value={pass?.qr_token || ''}
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>

        {passCode && (
          <p className="text-cyan-400 font-bold font-mono text-base sm:text-lg tracking-wide">
            {passCode}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-slate-400'}`} />
          {isExpired ? (
            <span className="text-red-400 text-sm font-medium">Pase expirado</span>
          ) : (
            <span className={`text-sm ${isUrgent ? 'text-red-400 animate-pulse font-semibold' : 'text-slate-400'}`}>
              El pase se renueva en: {formatTime(secondsLeft)}
            </span>
          )}
        </div>

        <div className="w-full rounded-2xl bg-[#0d1a2e] border border-slate-700/50 p-4 space-y-1.5 text-center">
          <p className="text-sm text-white">
            <span className="text-slate-400">Titular: </span>
            <span className="font-medium">{user?.full_name || 'Sin nombre'}</span>
          </p>
          <p className="text-sm text-white">
            <span className="text-slate-400">DNI: </span>
            <span className="font-medium font-mono">
              {dni ? Number(dni).toLocaleString('es-AR') : 'No registrado'}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400">Patente: </span>
            <span className="text-cyan-400 font-bold">{plate}</span>
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 px-4 rounded-xl font-outfit font-semibold text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] cursor-pointer"
        >
          Volver al tablero
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}