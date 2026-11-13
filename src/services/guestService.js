import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function getRequestConfig() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No hay una sesión activa.');
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;

  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail[0]?.msg || fallback;
  return error.message || fallback;
}

function guestsUrl(parkingLotId) {
  return `${API_BASE_URL}/api/v1/admin/parking-lots/${encodeURIComponent(parkingLotId)}/guests`;
}

export async function getGuestVehicles(parkingLotId) {
  try {
    const { data } = await axios.get(guestsUrl(parkingLotId), getRequestConfig());
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudieron cargar los invitados.'));
  }
}

export async function registerGuestVehicle(parkingLotId, patente) {
  try {
    const { data } = await axios.post(
      guestsUrl(parkingLotId),
      { patente },
      getRequestConfig()
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo registrar el invitado.'));
  }
}

export async function removeGuestVehicle(parkingLotId, patente) {
  try {
    const { data } = await axios.delete(
      `${guestsUrl(parkingLotId)}/${encodeURIComponent(patente)}`,
      getRequestConfig()
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo quitar el invitado.'));
  }
}