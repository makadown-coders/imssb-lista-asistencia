import { DocumentPlaceholders, HolidayRule } from '../models/attendance.model';

export const MONTHS_CATALOG: { value: number; label: string; upper: string }[] = [
  { value: 1, label: 'Enero', upper: 'ENERO' },
  { value: 2, label: 'Febrero', upper: 'FEBRERO' },
  { value: 3, label: 'Marzo', upper: 'MARZO' },
  { value: 4, label: 'Abril', upper: 'ABRIL' },
  { value: 5, label: 'Mayo', upper: 'MAYO' },
  { value: 6, label: 'Junio', upper: 'JUNIO' },
  { value: 7, label: 'Julio', upper: 'JULIO' },
  { value: 8, label: 'Agosto', upper: 'AGOSTO' },
  { value: 9, label: 'Septiembre', upper: 'SEPTIEMBRE' },
  { value: 10, label: 'Octubre', upper: 'OCTUBRE' },
  { value: 11, label: 'Noviembre', upper: 'NOVIEMBRE' },
  { value: 12, label: 'Diciembre', upper: 'DICIEMBRE' },
];

export const DEFAULT_PLACEHOLDERS: DocumentPlaceholders = {
  nombre: 'INSERTE NOMBRE COMPLETO AQUÍ',
  puesto: 'INSERTE PUESTO AQUÍ',
  mes: 'MARZO',
  anio: '2026',
  jornada: 'LUNES A VIERNES',
  horario: '08:00 – 17:00 HRS',
  adscripcion: 'COORDINACIÓN ESTATAL DE IMSS BIENESTAR BAJA CALIFORNIA',
  firmante: 'Lic. José Luis Acevedo De La Peña',
};

/**
 * Catálogo hardcodeado de días festivos por año.
 * Por definición inicial, todos tienen `moveToMonday: false` (fijos el día que caigan).
 * La estructura soporta cambiar `moveToMonday: true` cuando RH confirme cuáles se recorren.
 */
export const INITIAL_HOLIDAY_RULES: HolidayRule[] = [
  {
    id: 'new-year',
    month: 1,
    day: 1,
    name: 'Año Nuevo',
    moveToMonday: false,
  },
  {
    id: 'constitution-day',
    month: 2,
    day: 5,
    name: 'Día de la Constitución Mexicana',
    moveToMonday: false,
    nthMonday: 1,
  },
  {
    id: 'benito-juarez',
    month: 3,
    day: 21,
    name: 'Natalicio de Benito Juárez',
    moveToMonday: false,
    nthMonday: 3,
  },
  {
    id: 'labor-day',
    month: 5,
    day: 1,
    name: 'Día del Trabajo',
    moveToMonday: false,
  },
  {
    id: 'independence-day',
    month: 9,
    day: 16,
    name: 'Día de la Independencia',
    moveToMonday: false,
  },
  {
    id: 'revolution-day',
    month: 11,
    day: 20,
    name: 'Día de la Revolución Mexicana',
    moveToMonday: false,
    nthMonday: 3,
  },
  {
    id: 'christmas',
    month: 12,
    day: 25,
    name: 'Navidad',
    moveToMonday: false,
  },
];
