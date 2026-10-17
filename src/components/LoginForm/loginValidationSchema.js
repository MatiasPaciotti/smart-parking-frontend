import * as Yup from 'yup';

const unsamEmailRegex = /^[a-zA-Z0-9._%+-]+@(unsam\.edu\.ar|estudiantes\.unsam\.edu\.ar)$/i;

export const loginSchema = Yup.object().shape({
  correo: Yup.string()
    .trim()
    .required('El correo institucional es obligatorio.')
    .matches(
      unsamEmailRegex,
      'Acceso restringido: Debe ingresar con su cuenta institucional UNSAM'
    ),

  password: Yup.string()
    .required('La contraseña es obligatoria.'),
});