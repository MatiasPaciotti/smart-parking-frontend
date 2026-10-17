import React from 'react';

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
  return (
    <div>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          {label}
        </label>
      )}
      <input
        type={type}
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
          error
            ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
            : 'border-slate-700/60 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
        }`}
      />
      {error && (
        <p className="text-rose-400 text-[11px] mt-1 pl-1 flex items-center gap-1 leading-tight">
            {error}
        </p>
      )}
    </div>
  );
}