import * as Yup from 'yup';
import { patentRegex } from '../RegisterForm/validationSchema';

export const guestVehicleSchema = Yup.object({
  patente: Yup.string()
    .trim()
    .matches(patentRegex, 'Formato inválido (Ej: AAA123 o AA123BC).')
    .required('La patente es obligatoria.'),
});