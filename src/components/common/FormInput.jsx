import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormInput({
  label,
  icon: Icon,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
  maxLength,
  uppercase = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full bg-[#162032] border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all disabled:opacity-50 ${
            uppercase ? 'uppercase' : ''
          } ${
            isPassword ? 'pr-10' : ''
          } ${
            error
              ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-700/60 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-rose-400 text-[11px] mt-1 pl-1 flex items-center gap-1 leading-tight">
            {error}
        </p>
      )}
    </div>
  );
}