import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import FormInput from '../common/FormInput';
import { loginSchema } from './loginValidationSchema';
import { loginUser } from '../../services/authService';
import {
  setLoading,
  setLoginSuccess,
  setRegisterError,
  clearError,
} from '../../store/slices/authSlice';

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: serverError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const validateSingleField = async (name, value) => {
    try {
      await loginSchema.validateAt(name, { [name]: value });
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (serverError) dispatch(clearError());
    if (errors[name]) validateSingleField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateSingleField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      setErrors({});

      dispatch(setLoading(true));

      const data = await loginUser(formData);

      dispatch(
        setLoginSuccess({
          user: data.user,
          token: data.access_token || data.token,
        })
      );

      const userRole = data.user?.role;
      if (userRole === 'admin') {
        navigate('/guard');      
      } else {
        navigate('/dashboard');  
      }

    } catch (err) {
      if (err.name === 'ValidationError') {
        const formErrors = {};
        err.inner.forEach((item) => {
          formErrors[item.path] = item.message;
        });
        setErrors(formErrors);
      } else {
        dispatch(setRegisterError(err.message || 'Error al iniciar sesión.'));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div>
      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
          <div className="flex-1 leading-snug font-medium">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        <FormInput
          label="Correo Institucional UNSAM"
          icon={Mail}
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          placeholder="usuario@estudiantes.unsam.edu.ar"
          error={errors.correo}
        />

        <FormInput
          label="Contraseña"
          icon={Lock}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          placeholder="*********"
          error={errors.password}
        />

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
                Ingresando...
              </>
            ) : (
              <>
                Ingresar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}