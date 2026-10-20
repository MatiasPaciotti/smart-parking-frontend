import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/parking-lots`;

export async function getParkingLotOccupancy(parkingLotId) {
  if (!parkingLotId) return null;
  const { data } = await axios.get(`${API_URL}/${parkingLotId}/occupancy`);
  return data;
}