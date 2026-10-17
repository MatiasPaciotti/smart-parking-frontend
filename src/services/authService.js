import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/auth`;

export const registerUser = async (userData) => {
  const parts = userData.nombreApellido.trim().split(/\s+/);
  const nombre = parts[0];
  const apellido = parts.slice(1).join(' '); 

  try {
    const response = await axios.post(`${API_URL}/register`, {
      nombre: nombre,
      apellido: apellido,
      email: userData.correo.trim().toLowerCase(),
      patente: userData.patente.toUpperCase().replace(/\s+/g, ''),
      dni: parseInt(userData.dni, 10), 
      password: userData.password,
    });

    return response.data;

  } catch (error) {
    const serverMessage = 
      error.response?.data?.detail || 
      error.message || 
      'Error de conexión con el servidor.';

    const message = Array.isArray(serverMessage) 
      ? serverMessage[0]?.msg 
      : serverMessage;

    throw new Error(message);
  }
};