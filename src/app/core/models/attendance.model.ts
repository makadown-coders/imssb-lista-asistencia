export type HolidayScope = 'general' | 'additional';
export type HolidayDateRule =
  | { type: 'fixed'; month: number; day: number }
  | { type: 'nth-weekday'; month: number; weekday: number; occurrence: number };
export interface HolidayRule { id: string; name: string; scope: HolidayScope; dateRule: HolidayDateRule; applicability?: string; }
export interface InstitutionalCalendar { year: number; source: string; confirmed: boolean; holidays: HolidayRule[]; }
export interface DayInfo { day: number; date: Date; dayOfWeek: number; dayName: string; isWeekend: boolean; isHoliday: boolean; holidayName?: string; isShaded: boolean; }
export interface MonthCalendarSummary { year: number; month: number; monthName: string; daysInMonth: number; secondSectionStartDay: number; isLeapYear: boolean; hasConfirmedInstitutionalCalendar: boolean; weekendDaysCount: number; effectiveHolidaysCount: number; workingDaysCount: number; days: DayInfo[]; }
export interface DocumentPlaceholders { nombre: string; puesto: string; mes: string; anio: string; jornada: string; horario: string; adscripcion: string; }
