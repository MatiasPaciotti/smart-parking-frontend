import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/auth`;

export const loginUser = async ({ correo, password }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: correo.trim().toLowerCase(),
      password: password,
    });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    const serverMessage = error.response?.data?.detail || error.message || 'Correo o contraseña incorrectos.';
    const message = Array.isArray(serverMessage) ? serverMessage[0]?.msg : serverMessage;
    throw new Error(message);
  }
};

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


const buildRequestError = (error, fallbackMessage) => {
  const detail = error.response?.data?.detail;
  const requestError = new Error(typeof detail === 'string' ? detail : fallbackMessage);
  requestError.status = error.response?.status;
  return requestError;
};

export const verifyEmail = async ({ email, code }) => {
  try {
    const response = await axios.post(`${API_URL}/verify-email`, {
      email: email.trim().toLowerCase(),
      code,
    });
    return response.data;
  } catch (error) {
    throw buildRequestError(error, 'No se pudo verificar el código. Revisá tu conexión e intentá nuevamente.');
  }
};

export const resendVerification = async ({ email }) => {
  try {
    const response = await axios.post(`${API_URL}/resend-verification`, {
      email: email.trim().toLowerCase(),
    });
    return response.data;
  } catch (error) {
    throw buildRequestError(error, 'No se pudo enviar el código. Intentá nuevamente más tarde.');
  }
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No hay una sesión iniciada.');
  }

  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const serverMessage =
      error.response?.data?.detail ||
      error.message ||
      'No se pudo obtener el perfil del usuario.';

    throw new Error(
      Array.isArray(serverMessage)
        ? serverMessage[0]?.msg
        : serverMessage
    );
  }
};
