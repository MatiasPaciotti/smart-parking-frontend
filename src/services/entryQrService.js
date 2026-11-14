import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const SCAN_PATHS = [
  '/api/v1/parking-lots/entry/qr/scan',
  '/api/v1/parking-lots/exit/qr/scan',
];

function buildScanError(error) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/');
    return new Error('La sesión del administrador venció. Iniciá sesión nuevamente.');
  }

  if (status === 400) {
    return new Error('El QR es inválido o venció. Pedile al usuario que genere uno nuevo y escanealo dentro de los 5 minutos.');
  }

  const message = typeof detail === 'string'
    ? detail
    : Array.isArray(detail)
      ? detail[0]?.msg
      : 'No se pudo registrar el movimiento. Revisá la conexión e intentá nuevamente.';
  return new Error(message);
}

export async function scanParkingQr(qrToken) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay una sesión activa.');

  let lastError;
  for (const path of SCAN_PATHS) {
    try {
      const { data } = await axios.post(
        API_BASE_URL + path,
        { qr_token: qrToken.trim() },
        { headers: { Authorization: 'Bearer ' + token } },
      );
      return data;
    } catch (error) {
      lastError = error;
      // A 400 means this token is not for this QR purpose. Try the other operation.
      if (error.response?.status !== 400) throw buildScanError(error);
    }
  }

  throw buildScanError(lastError);
}
