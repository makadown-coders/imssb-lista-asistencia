import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DEFAULT_PLACEHOLDERS,
  INITIAL_HOLIDAY_RULES,
  MONTHS_CATALOG,
} from './core/data/holidays.data';
import {
  DayInfo,
  DocumentPlaceholders,
  HolidayRule,
} from './core/models/attendance.model';
import { CalendarService } from './core/services/calendar.service';
import { DocxGeneratorService } from './core/services/docx-generator.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly calendarService = inject(CalendarService);
  private readonly docxGenerator = inject(DocxGeneratorService);

  readonly months = MONTHS_CATALOG;
  readonly availableYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  // Estado reactivo con Angular Signals
  readonly selectedYear = signal<number>(2026);
  readonly selectedMonth = signal<number>(3); // Marzo por defecto

  readonly nombrePlaceholder = signal<string>(DEFAULT_PLACEHOLDERS.nombre);
  readonly puestoPlaceholder = signal<string>(DEFAULT_PLACEHOLDERS.puesto);
  readonly jornada = signal<string>(DEFAULT_PLACEHOLDERS.jornada);
  readonly horario = signal<string>(DEFAULT_PLACEHOLDERS.horario);
  readonly adscripcion = signal<string>(DEFAULT_PLACEHOLDERS.adscripcion);
  readonly firmante = signal<string>(DEFAULT_PLACEHOLDERS.firmante);

  readonly showHolidayNameInObs = signal<boolean>(false);
  readonly holidayRules = signal<HolidayRule[]>(
    INITIAL_HOLIDAY_RULES.map((r) => ({ ...r }))
  );
  readonly customShadedDays = signal<Set<number>>(new Set());

  readonly isGenerating = signal<boolean>(false);
  readonly lastDownloadedFile = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Calendario calculado automáticamente al cambiar mes, año o reglas de festivos
  readonly calendarSummary = computed(() =>
    this.calendarService.buildMonthCalendar(
      this.selectedYear(),
      this.selectedMonth(),
      this.holidayRules(),
      this.customShadedDays()
    )
  );

  readonly firstHalfDays = computed(() =>
    this.calendarSummary().days.filter((d) => d.day <= 15)
  );

  readonly secondHalfDays = computed(() =>
    this.calendarSummary().days.filter((d) => d.day >= 16)
  );

  readonly currentMonthHolidayRules = computed(() => {
    const m = this.selectedMonth();
    const yr = this.selectedYear();
    return this.holidayRules()
      .filter((r) => r.month === m)
      .map((rule) => {
        const resolvedDay = this.calendarService.resolveHolidayDay(yr, rule);
        const dow =
          resolvedDay !== null
            ? new Date(yr, m - 1, resolvedDay).getDay()
            : -1;
        const fallsOnWeekend = dow === 0 || dow === 6;
        return {
          ...rule,
          resolvedDay,
          fallsOnWeekend,
        };
      });
  });

  onYearChange(yearValue: number | string): void {
    this.selectedYear.set(Number(yearValue));
    this.customShadedDays.set(new Set());
    this.lastDownloadedFile.set(null);
  }

  onMonthChange(monthValue: number | string): void {
    this.selectedMonth.set(Number(monthValue));
    this.customShadedDays.set(new Set());
    this.lastDownloadedFile.set(null);
  }

  toggleRuleMoveToMonday(ruleId: string): void {
    this.holidayRules.update((rules) =>
      rules.map((r) =>
        r.id === ruleId ? { ...r, moveToMonday: !r.moveToMonday } : r
      )
    );
    this.lastDownloadedFile.set(null);
  }

  setAllHolidaysMoveToMonday(moveToMonday: boolean): void {
    this.holidayRules.update((rules) =>
      rules.map((r) => ({ ...r, moveToMonday }))
    );
    this.lastDownloadedFile.set(null);
  }

  toggleCustomDayShade(dayInfo: DayInfo): void {
    if (dayInfo.isWeekend || dayInfo.isHoliday) {
      return; // Fines de semana y festivos oficiales ya están sombreados por regla
    }
    this.customShadedDays.update((prev) => {
      const next = new Set(prev);
      if (next.has(dayInfo.day)) {
        next.delete(dayInfo.day);
      } else {
        next.add(dayInfo.day);
      }
      return next;
    });
    this.lastDownloadedFile.set(null);
  }

  resetPlaceholders(): void {
    this.nombrePlaceholder.set(DEFAULT_PLACEHOLDERS.nombre);
    this.puestoPlaceholder.set(DEFAULT_PLACEHOLDERS.puesto);
  }

  async downloadWordTemplate(): Promise<void> {
    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.lastDownloadedFile.set(null);

    try {
      const summary = this.calendarSummary();
      const placeholders: DocumentPlaceholders = {
        nombre:
          this.nombrePlaceholder().trim() || DEFAULT_PLACEHOLDERS.nombre,
        puesto:
          this.puestoPlaceholder().trim() || DEFAULT_PLACEHOLDERS.puesto,
        mes: summary.monthName,
        anio: String(summary.year),
        jornada: this.jornada(),
        horario: this.horario(),
        adscripcion: this.adscripcion(),
        firmante: this.firmante(),
      };

      const fileName = await this.docxGenerator.downloadAttendanceDocx({
        calendar: summary,
        placeholders,
        showHolidayNameInObservations: this.showHolidayNameInObs(),
      });

      this.lastDownloadedFile.set(fileName);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error inesperado al generar el archivo Word.';
      this.errorMessage.set(msg);
    } finally {
      this.isGenerating.set(false);
    }
  }
}
