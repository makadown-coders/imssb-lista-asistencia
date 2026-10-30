import { Injectable } from '@angular/core';
import { DayInfo, HolidayRule, MonthCalendarSummary } from '../models/attendance.model';
import { MONTHS_CATALOG } from '../data/holidays.data';

const DAY_NAMES_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  /**
   * Determina si un año es bisiesto.
   */
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Obtiene el número exacto de días del mes (28, 29, 30 o 31).
   * @param year Año (ej. 2026)
   * @param month Mes 1-based (1 = Enero ... 12 = Diciembre)
   */
  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Calcula el día del mes en que aplica un festivo según su regla
   * (`moveToMonday: false` => día fijo; `moveToMonday: true` => se recorre al lunes).
   */
  resolveHolidayDay(year: number, rule: HolidayRule): number | null {
    const daysInMonth = this.getDaysInMonth(year, rule.month);
    if (rule.day < 1 || rule.day > daysInMonth) {
      return null;
    }

    if (!rule.moveToMonday) {
      // Regla estricta: cae exactamente en su día calendario.
      return rule.day;
    }

    // Si tiene definido un n-ésimo lunes oficial (ej. 1er lunes de feb, 3er lunes de mar/nov)
    if (rule.nthMonday && rule.nthMonday > 0) {
      let mondayCount = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, rule.month - 1, d).getDay();
        if (dow === 1) {
          mondayCount++;
          if (mondayCount === rule.nthMonday) {
            return d;
          }
        }
      }
    }

    // Si es recorrible al lunes genérico (ej. cae en miércoles y se recorre al lunes de esa semana)
    const originalDate = new Date(year, rule.month - 1, rule.day);
    const dow = originalDate.getDay(); // 0 = Dom, 1 = Lun, ..., 6 = Sáb

    if (dow === 0 || dow === 6) {
      // Si cae en sábado o domingo, queda en fin de semana (como si no hubiera festivo entre semana)
      return rule.day;
    }

    if (dow === 1) {
      return rule.day;
    }

    // Se recorre al lunes de esa misma semana (o al lunes siguiente si el lunes cayó en el mes anterior)
    const mondaySameWeek = rule.day - (dow - 1);
    if (mondaySameWeek >= 1) {
      return mondaySameWeek;
    }
    return rule.day + (8 - dow);
  }

  /**
   * Construye el calendario completo del mes con fines de semana y festivos sombreados.
   */
  buildMonthCalendar(
    year: number,
    month: number,
    holidayRules: HolidayRule[],
    customShadedDays: Set<number> = new Set()
  ): MonthCalendarSummary {
    const daysInMonth = this.getDaysInMonth(year, month);
    const isLeap = this.isLeapYear(year);
    const monthEntry = MONTHS_CATALOG.find((m) => m.value === month);
    const monthName = monthEntry ? monthEntry.upper : '';

    // Mapear festivos que corresponden a este mes
    const resolvedHolidays = new Map<number, string>();
    for (const rule of holidayRules) {
      if (rule.month === month) {
        const targetDay = this.resolveHolidayDay(year, rule);
        if (targetDay !== null) {
          resolvedHolidays.set(targetDay, rule.name);
        }
      }
    }

    const days: DayInfo[] = [];
    let weekendDaysCount = 0;
    let effectiveHolidaysCount = 0;
    let workingDaysCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holidayName = resolvedHolidays.get(d);

      // Si cae en sábado o domingo y no es recorrible, cuenta como fin de semana normal
      const isHoliday = Boolean(holidayName) && !isWeekend;
      const isCustomShaded = customShadedDays.has(d);
      const isShaded = isWeekend || isHoliday || isCustomShaded;

      if (isWeekend) {
        weekendDaysCount++;
      } else if (isHoliday || isCustomShaded) {
        effectiveHolidaysCount++;
      } else {
        workingDaysCount++;
      }

      days.push({
        day: d,
        date,
        dayOfWeek,
        dayName: DAY_NAMES_ES[dayOfWeek],
        isWeekend,
        isHoliday,
        holidayName,
        isCustomShaded,
        isShaded,
      });
    }

    return {
      year,
      month,
      monthName,
      daysInMonth,
      isLeapYear: isLeap,
      weekendDaysCount,
      effectiveHolidaysCount,
      workingDaysCount,
      days,
    };
  }
}
