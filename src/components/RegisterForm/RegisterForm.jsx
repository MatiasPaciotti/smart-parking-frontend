import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLoading,
  setRegisterSuccess,
  setRegisterError,
  clearError,
} from '../../store/slices/authSlice';
import { registerSchema } from './validationSchema';
import { registerUser } from '../../services/authService';
import { UserIcon, DniIcon, CarIcon, MailIcon, LockIcon } from './RegisterIcons';
import logoSmartParking from '../../assets/logo.webp';

export default function RegisterForm() {
  const dispatch = useDispatch();
  const { loading, error: serverError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nombreApellido: '',
    dni: '',
    patente: '',
    correo: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateSingleField = async (name, value) => {
    try {
      await registerSchema.validateAt(name, { [name]: value });
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'patente') {
      finalValue = value.toUpperCase().replace(/\s+/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (serverError) dispatch(clearError());
    if (errors[name]) validateSingleField(name, finalValue);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateSingleField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    dispatch(clearError());

    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});

      dispatch(setLoading(true));

      const data = await registerUser(formData);

      setSuccessMessage('¡Registro completado! Redirigiendo...');

      setTimeout(() => {
        dispatch(setRegisterSuccess(data.user));
      }, 1000);

    } catch (err) {
      if (err.name === 'ValidationError') {
        const formErrors = {};
        err.inner.forEach((item) => {
          formErrors[item.path] = item.message;
        });
        setErrors(formErrors);
      } else {
        dispatch(setRegisterError(err.message || 'Error al registrarse.'));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="w-full rounded-[28px] bg-[#0d1527]/90 border border-slate-800/80 p-5 sm:p-6 shadow-2xl backdrop-blur-md text-white font-inter">
      
      <div className="flex flex-col items-center justify-center mb-5">
        <img
          src={logoSmartParking}
          alt="SmartParking UNSAM"
          className="h-28 w-auto object-contain drop-shadow-md select-none pointer-events-none"
        />
      </div>

      <div className="flex p-1 bg-[#162032] rounded-xl mb-4 border border-slate-800">
        <button
          type="button"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Iniciar Sesión
        </button>

        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Registrarse
        </button>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
          <div className="flex-1 leading-snug font-medium">{serverError}</div>
        </div>
      )}

      {/* Alerta de Éxito */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
          <div className="flex-1 leading-snug font-medium">{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
            <UserIcon />
            Nombre y Apellido
          </label>
          <input
            type="text"
            name="nombreApellido"
            value={formData.nombreApellido}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            placeholder="Ej. Leonardo Pisculichi"
            className={`w-full bg-[#162032] border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50 ${
              errors.nombreApellido 
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-slate-700/60 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
            }`}
          />
          {errors.nombreApellido && (
            <p className="text-rose-400 text-[11px] mt-1 pl-1">{errors.nombreApellido}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <DniIcon />
              DNI
            </label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="Ej. 42345678"
              maxLength={8}
              className={`w-full bg-[#162032] border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50 ${
                errors.dni 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-slate-700/60 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
              }`}
            />
            {errors.dni && (
              <p className="text-rose-400 text-[10px] mt-1 pl-1 leading-tight">{errors.dni}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <CarIcon />
              Patente
            </label>
            <input
              type="text"
              name="patente"
              value={formData.patente}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="Ej. AA123BC"
              maxLength={7}
              className={`w-full bg-[#162032] border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none uppercase transition-all disabled:opacity-50 ${
                errors.patente 
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-slate-700/60 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
              }`}
            />
            {errors.patente && (
              <p className="text-rose-400 text-[10px] mt-1 pl-1 leading-tight">{errors.patente}</p>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
            <MailIcon />
            Correo Institucional UNSAM
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            placeholder="usuario@estudiantes.unsam.edu.ar"
            className={`w-full bg-[#162032] border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50 ${
              errors.correo 
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-slate-700/60 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
            }`}
          />
          {errors.correo && (
            <p className="text-rose-400 text-[11px] mt-1 pl-1">{errors.correo}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
            <LockIcon />
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            placeholder="*********"
            className={`w-full bg-[#162032] border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50 ${
              errors.password 
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                : 'border-slate-700/60 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
            }`}
          />
          {errors.password && (
            <p className="text-rose-400 text-[11px] mt-1 pl-1">{errors.password}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-outfit font-semibold text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25 ${
              loading
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </>
            ) : (
              <>
                Registrar cuenta e ingresar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}