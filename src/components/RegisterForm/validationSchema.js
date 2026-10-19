import * as Yup from 'yup';

const unsamEmailRegex = /^[a-zA-Z0-9._%+-]+@(unsam\.edu\.ar|estudiantes\.unsam\.edu\.ar|unsam-bue\.edu\.ar)$/i;
const patentRegex = /^([A-Z]{3}[0-9]{3}|[A-Z]{2}[0-9]{3}[A-Z]{2})$/;
const dniRegex = /^[0-9]{7,8}$/;

export const registerSchema = Yup.object().shape({
  nombreApellido: Yup.string()
    .trim()
    .required('El nombre y apellido son obligatorios.')
    .test(
      'is-full-name',
      'Tenés que ingresar nombre y apellido.',
      (value) => {
        if (!value) return false;
        const parts = value.trim().split(/\s+/);
        return parts.length >= 2 && parts.every((p) => p.length >= 2);
      }
    ),

  dni: Yup.string()
    .trim()
    .matches(dniRegex, 'El DNI debe tener entre 7 y 8 números.')
    .required('El DNI es obligatorio.'),

  patente: Yup.string()
    .trim()
    .matches(patentRegex, 'Formato inválido (Ej: AAA123 o AA123BC).')
    .required('La patente es obligatoria.'),

  correo: Yup.string()
    .trim()
    .matches(unsamEmailRegex, 'Debe ser un correo oficial (@unsam.edu.ar o @estudiantes.unsam.edu.ar).')
    .required('El correo institucional es obligatorio.'),

  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .required('La contraseña es obligatoria.'),
});