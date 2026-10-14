// URL base del backend (para pruebas locales usar localhost propio, ej: http://localhost:3000 o 8080)
const API_URL = 'http://localhost:5173'; //iría 'http://localhost:3000/api'; por ejemplo

export const registerUser = async (userData) => {
  // Descomentar este bloque cuando esté corriendo el backend:
  /*
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombreApellido: userData.nombreApellido,
      dni: userData.dni,
      patente: userData.patente,
      correo: userData.correo,
      password: userData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Lanza el error devuelto por el backend (ej: "La patente ingresada ya se encuentra registrada")
    throw new Error(data.message || 'Error al procesar el registro');
  }

  return data;
  */

  // ---  TEMPORAL PARA PROBAR EN FRONTEND (Simula 1.5 seg de respuesta) ---
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulamos el caso de error de negocio si la patente es "AA123BB" (para probar la alerta)
  if (userData.patente === 'AA123BB') {
    throw new Error('La patente ingresada ya se encuentra registrada');
  }

  return { success: true };
};