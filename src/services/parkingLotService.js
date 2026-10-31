import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/parking-lots`;

export async function getParkingLots() {
  try {
    const response = await axios.get(API_URL);
    const data = response.data;

    if (!Array.isArray(data?.parking_lots)) {
      throw new Error('La respuesta de estacionamientos no tiene el formato esperado.');
    }

    return data;
  } catch (error) {
    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string' ? detail : error.message || 'No se pudieron cargar los estacionamientos.';
    throw new Error(message);
  }
}

export async function getParkingLotOccupancy(parkingLotId) {
  if (!parkingLotId) return null;
  try {
    const { data } = await axios.get(`${API_URL}/${parkingLotId}/occupancy`);
    return data;
  } catch (error) {
    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string' ? detail : error.message || 'No se pudo obtener la ocupación del estacionamiento.';
    throw new Error(message);
  }
}