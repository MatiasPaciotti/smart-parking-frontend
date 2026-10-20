import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

export default function ParkingLotSelector({
  lots = [],
  selectedLotId,
  onChange,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLot = lots.find((lot) => lot.id === selectedLotId) || lots[0];

  return (
    <div 
      className={`w-full bg-[#0B132B] border border-sky-500/50 rounded-2xl shadow-md transition-all overflow-hidden ${className}`} 
      ref={containerRef}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-white hover:bg-[#0f172a] transition-colors cursor-pointer disabled:opacity-50"
      >
        <div className="flex items-center gap-3 truncate">
          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-sm font-medium truncate">
            {currentLot ? `Estacionamiento ${currentLot.name}` : 'Seleccionar Estacionamiento'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-sky-500/20 bg-[#070d1f]">
          {lots.map((lot) => {
            const isSelected = lot.id === selectedLotId;
            return (
              <button
                key={lot.id}
                type="button"
                onClick={() => {
                  onChange(lot.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border-l-4 border-sky-400'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>Estacionamiento {lot.name}</span>
                {isSelected && <MapPin className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}