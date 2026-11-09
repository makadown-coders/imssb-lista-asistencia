import { TestBed } from '@angular/core/testing';
import { CalendarService } from './calendar.service';

describe('CalendarService', () => {
  let service: CalendarService;
  beforeEach(() => { service = TestBed.inject(CalendarService); });

  it('calcula febrero de 2026 y su primer lunes institucional', () => {
    const calendar = service.buildMonthCalendar(2026, 2);
    expect(calendar.daysInMonth).toBe(28);
    expect(calendar.days.find((day) => day.day === 2)?.isHoliday).toBe(true);
  });

  it('marca el lunes 16 de marzo de 2026', () => {
    expect(service.buildMonthCalendar(2026, 3).days.find((day) => day.day === 16)?.isHoliday).toBe(true);
  });

  it('no aplica indiscriminadamente el descanso adicional del 5 de mayo', () => {
    const calendar = service.buildMonthCalendar(2026, 5);
    expect(calendar.days.find((day) => day.day === 1)?.isHoliday).toBe(true);
    expect(calendar.days.find((day) => day.day === 5)?.isHoliday).toBe(false);
  });

  it('marca el tercer lunes de noviembre de 2026', () => {
    expect(service.buildMonthCalendar(2026, 11).days.find((day) => day.day === 16)?.isHoliday).toBe(true);
  });

  it('calcula febrero de 2028 y proyecta el criterio institucional de 2026', () => {
    const calendar = service.buildMonthCalendar(2028, 2);
    expect(calendar.daysInMonth).toBe(29);
    expect(calendar.isLeapYear).toBe(true);
    expect(calendar.hasConfirmedInstitutionalCalendar).toBe(false);
    expect(calendar.days.find((day) => day.day === 7)?.isHoliday).toBe(true);
  });
});
