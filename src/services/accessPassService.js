import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function generateAccessPass(parkingLotId) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No hay una sesión activa.');
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/parking-lots/${parkingLotId}/entry/qr`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail[0]?.msg
        : error.message || 'No se pudo generar el pase de acceso.';
    throw new Error(message);
  }
}

export async function generateExitPass() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No hay una sesión activa.');
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/parking-lots/exit/qr`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail[0]?.msg
        : error.message || 'No se pudo generar el pase de salida.';
    throw new Error(message);
  }
}