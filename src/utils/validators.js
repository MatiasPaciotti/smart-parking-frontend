export const validateEmail = (email) => {
  if (!email.trim()) {
    return 'El correo institucional es obligatorio.';
  }
  
  const unsamEmailRegex = /^[a-zA-Z0-9._%+-]+@(unsam\.edu\.ar|estudiantes\.unsam\.edu\.ar)$/i;

  if (!unsamEmailRegex.test(email.trim())) {
    return 'Debe ser un correo oficial (@unsam.edu.ar o @estudiantes.unsam.edu.ar).';
  }
  return '';
};

export const validatePatent = (patent) => {
  const cleanPatent = patent.toUpperCase().replace(/\s+/g, '');

  if (!cleanPatent) {
    return 'La patente es obligatoria.';
  }

  const traditionalRegex = /^[A-Z]{3}[0-9]{3}$/;

  const mercosurRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

  if (!traditionalRegex.test(cleanPatent) && !mercosurRegex.test(cleanPatent)) {
    return 'Formato inválido (Ej: AAA123 o AA123BC).';
  }

  return '';
};

export const validateDni = (dni) => {
  if (!dni.trim()) {
    return 'El DNI es obligatorio.';
  }
  const dniRegex = /^[0-9]{7,8}$/;
  if (!dniRegex.test(dni.trim())) {
    return 'El DNI debe tener entre 7 y 8 números.';
  }
  return '';
};

export const validateName = (name) => {
  if (!name.trim()) {
    return 'El nombre y apellido son obligatorios.';
  }
  if (name.trim().length < 3) {
    return 'Debe tener al menos 3 caracteres.';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'La contraseña es obligatoria.';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  return '';
};