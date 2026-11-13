import React, { useEffect, useRef, useState } from 'react';
import { Clock3, Plus, Trash2, Users } from 'lucide-react';
import FormInput from '../common/FormInput';
import {
  getGuestVehicles,
  registerGuestVehicle,
  removeGuestVehicle,
} from '../../services/guestService';
import { guestVehicleSchema } from './guestValidationSchema';
import RemoveGuestModal from './RemoveGuestModal';

function formatEntryTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Hora no disponible';

  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GuestVehiclesCard({ parkingLotId, occupancyData, onChange }) {
  const [patente, setPatente] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [guests, setGuests] = useState([]);
  const [guestsLotId, setGuestsLotId] = useState('');
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removingPlate, setRemovingPlate] = useState('');
  const [guestToRemove, setGuestToRemove] = useState('');
  const [removalError, setRemovalError] = useState('');
  const [listError, setListError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const requestIdRef = useRef(0);
  const isFull = occupancyData && occupancyData.occupied >= occupancyData.capacity;
  const loadingCurrentLot = loadingGuests || Boolean(parkingLotId && guestsLotId !== parkingLotId);
  const currentGuests = guestsLotId === parkingLotId ? guests : [];
  const currentListError = guestsLotId === parkingLotId ? listError : '';

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (!parkingLotId) return undefined;

    getGuestVehicles(parkingLotId)
      .then((data) => {
        if (requestId === requestIdRef.current) {
          setGuests(data?.guests || []);
          setGuestsLotId(parkingLotId);
          setListError('');
        }
      })
      .catch((error) => {
        if (requestId === requestIdRef.current) {
          setGuests([]);
          setGuestsLotId(parkingLotId);
          setListError(error.message);
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoadingGuests(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [parkingLotId]);

  const refreshGuests = async () => {
    const requestId = ++requestIdRef.current;
    setLoadingGuests(true);
    setListError('');

    try {
      const data = await getGuestVehicles(parkingLotId);
      if (requestId === requestIdRef.current) {
        setGuests(data?.guests || []);
        setGuestsLotId(parkingLotId);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) setListError(error.message);
    } finally {
      if (requestId === requestIdRef.current) setLoadingGuests(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldError('');
    setFormMessage('');

    try {
      const values = await guestVehicleSchema.validate({ patente: patente.trim().toUpperCase() });
      setSubmitting(true);
      const result = await registerGuestVehicle(parkingLotId, values.patente);
      setPatente('');
      setFormMessage(result.message || 'Invitado registrado correctamente.');
      await refreshGuests();
      onChange?.();
    } catch (error) {
      if (error.name === 'ValidationError') {
        setFieldError(error.message);
      } else {
        setFormMessage(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (plate) => {
    setRemovingPlate(plate);
    setRemovalError('');
    setListError('');
    setFormMessage('');

    try {
      const result = await removeGuestVehicle(parkingLotId, plate);
      setFormMessage(result.message || 'Invitado retirado correctamente.');
      await refreshGuests();
      onChange?.();
      setGuestToRemove('');
    } catch (error) {
      setRemovalError(error.message);
    } finally {
      setRemovingPlate('');
    }
  };

  return (
    <section className="w-full rounded-3xl border border-slate-800/80 bg-[#0d1527]/90 p-4 shadow-2xl backdrop-blur-md sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-sky-400" aria-hidden="true" />
        <h2 className="font-outfit text-sm font-bold text-white sm:text-base">
          Vehículos de invitados
        </h2>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row sm:items-start" onSubmit={handleSubmit}>
        <div className="min-w-0 flex-1">
          <FormInput
            label="Patente"
            name="patente"
            value={patente}
            onChange={(event) => {
              setPatente(event.target.value.toUpperCase());
              setFieldError('');
            }}
            placeholder="AAA123 o AA123BC"
            error={fieldError}
            maxLength={7}
            uppercase
            disabled={!parkingLotId || submitting}
          />
        </div>
        <button
          type="submit"
          disabled={!parkingLotId || submitting || isFull}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 transition-colors hover:bg-sky-500/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'Registrando...' : 'Registrar invitado'}
        </button>
      </form>

      {isFull && (
        <p className="mt-2 text-xs text-amber-300">El estacionamiento está completo.</p>
      )}
      {formMessage && (
        <p role="status" className="mt-3 text-sm text-emerald-300">{formMessage}</p>
      )}

      <div className="mt-5 border-t border-slate-800/70 pt-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Invitados estacionados
        </h3>

        {!parkingLotId ? (
          <p className="text-sm text-slate-400">Seleccioná un estacionamiento</p>
        ) : loadingCurrentLot ? (
          <p className="text-sm text-slate-400" role="status">Cargando invitados...</p>
        ) : currentListError ? (
          <p className="text-sm text-rose-300" role="alert">{currentListError}</p>
        ) : currentGuests.length === 0 ? (
          <p className="text-sm text-slate-400">No hay invitados estacionados</p>
        ) : (
          <ul className="divide-y divide-slate-800/70">
            {currentGuests.map((guest) => (
              <li
                key={guest.patente}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 font-mono text-sm font-semibold tracking-wider text-white">
                    {guest.patente}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatEntryTime(guest.entered_at)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRemovalError('');
                    setGuestToRemove(guest.patente);
                  }}
                  disabled={Boolean(removingPlate)}
                  title={`Quitar ${guest.patente}`}
                  aria-label={`Quitar ${guest.patente}`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 text-rose-300 transition-colors cursor-pointer hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {guestToRemove && (
        <RemoveGuestModal
          plate={guestToRemove}
          error={removalError}
          loading={removingPlate === guestToRemove}
          onConfirm={() => handleRemove(guestToRemove)}
          onCancel={() => {
            setGuestToRemove('');
            setRemovalError('');
          }}
        />
      )}
    </section>
  );
}