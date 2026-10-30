export interface HolidayRule {
  id: string;
  month: number; // 1 = Enero ... 12 = Diciembre
  day: number; // Día base del festivo (1..31)
  name: string;
  /**
   * Controla si el día festivo se recorre al lunes o si se respeta
   * estrictamente el día en que caiga.
   * Por defecto en esta etapa todos inician en `false` (fecha fija).
   */
  moveToMonday: boolean;
  /**
   * Si se activa `moveToMonday`, opcionalmente indica a qué lunes del mes
   * se recorre por ley (ej. 1 = primer lunes de feb, 3 = tercer lunes de mar/nov).
   * Si no se especifica `nthMonday`, se recorre al lunes de esa misma semana.
   */
  nthMonday?: number;
}

export interface DayInfo {
  day: number;
  date: Date;
  dayOfWeek: number; // 0 = Domingo ... 6 = Sábado
  dayName: string;
  isWeekend: boolean;
  isHoliday: boolean; // Festivo efectivo en día entre semana (o fin de semana)
  holidayName?: string;
  isCustomShaded: boolean;
  isShaded: boolean;
}

export interface MonthCalendarSummary {
  year: number;
  month: number; // 1..12
  monthName: string; // 'ENERO', 'FEBRERO', ...
  daysInMonth: number;
  isLeapYear: boolean;
  weekendDaysCount: number;
  effectiveHolidaysCount: number; // Festivos que caen entre semana
  workingDaysCount: number;
  days: DayInfo[];
}

export interface DocumentPlaceholders {
  nombre: string;
  puesto: string;
  mes: string;
  anio: string;
  jornada: string;
  horario: string;
  adscripcion: string;
  firmante: string;
}
