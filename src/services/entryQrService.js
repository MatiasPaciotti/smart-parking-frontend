import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function scanEntryQr(qrToken) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay una sesión activa.');

  try {
    const { data } = await axios.post(
      API_BASE_URL + '/api/v1/parking-lots/entry/qr/scan',
      { qr_token: qrToken.trim() },
      { headers: { Authorization: 'Bearer ' + token } },
    );
    return data;
  } catch (error) {
    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail[0]?.msg
        : 'No se pudo registrar el ingreso. Revisá la conexión e intentá nuevamente.';
    throw new Error(message);
  }
}
