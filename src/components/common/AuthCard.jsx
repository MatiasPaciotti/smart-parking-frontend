import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import logoSmartParking from '../../assets/logo.webp';

export default function AuthCard({ activeTab, onTabChange, children }) {
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
          onClick={() => onTabChange('login')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          Iniciar Sesión
        </button>

        <button
          type="button"
          onClick={() => onTabChange('register')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'register'
              ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Registrarse
        </button>
      </div>

      {children}
    </div>
  );
}