import { Injectable } from '@angular/core';
import { DayInfo, HolidayRule, MonthCalendarSummary } from '../models/attendance.model';
import { getInstitutionalCalendar, MONTHS_CATALOG } from '../data/holidays.data';

const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Injectable({ providedIn: 'root' })
export class CalendarService {
  isLeapYear(year: number): boolean { return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0; }
  getDaysInMonth(year: number, month: number): number { return new Date(year, month, 0).getDate(); }

  resolveHolidayDay(year: number, rule: HolidayRule): number | null {
    const dateRule = rule.dateRule;
    const daysInMonth = this.getDaysInMonth(year, dateRule.month);
    if (dateRule.type === 'fixed') return dateRule.day >= 1 && dateRule.day <= daysInMonth ? dateRule.day : null;
    let occurrences = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, dateRule.month - 1, day).getDay() === dateRule.weekday && ++occurrences === dateRule.occurrence) return day;
    }
    return null;
  }

  buildMonthCalendar(year: number, month: number): MonthCalendarSummary {
    const daysInMonth = this.getDaysInMonth(year, month);
    const institutionalCalendar = getInstitutionalCalendar(year);
    const confirmed = institutionalCalendar?.confirmed === true;
    const applicableCalendar = institutionalCalendar ?? getInstitutionalCalendar(2026);
    const resolvedHolidays = new Map<number, string>();
    for (const rule of applicableCalendar?.holidays ?? []) {
      if (rule.scope !== 'general' || rule.dateRule.month !== month) continue;
      const day = this.resolveHolidayDay(year, rule);
      if (day !== null) resolvedHolidays.set(day, rule.name);
    }
    const days: DayInfo[] = [];
    let weekendDaysCount = 0, effectiveHolidaysCount = 0, workingDaysCount = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holidayName = resolvedHolidays.get(day);
      const isHoliday = Boolean(holidayName);
      if (isWeekend) weekendDaysCount++; else if (isHoliday) effectiveHolidaysCount++; else workingDaysCount++;
      days.push({ day, date, dayOfWeek, dayName: DAY_NAMES_ES[dayOfWeek], isWeekend, isHoliday, holidayName, isShaded: isWeekend || isHoliday });
    }
    return { year, month, monthName: MONTHS_CATALOG.find((entry) => entry.value === month)?.upper ?? '', daysInMonth, isLeapYear: this.isLeapYear(year), hasConfirmedInstitutionalCalendar: confirmed, weekendDaysCount, effectiveHolidaysCount, workingDaysCount, days };
  }
}
