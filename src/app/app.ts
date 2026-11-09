import { DOCUMENT } from '@angular/common';
import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_PLACEHOLDERS, MONTHS_CATALOG } from './core/data/holidays.data';
import { DocumentPlaceholders } from './core/models/attendance.model';
import { CalendarService } from './core/services/calendar.service';
import { DocxGeneratorService } from './core/services/docx-generator.service';

@Component({ selector: 'app-root', imports: [FormsModule], templateUrl: './app.html', styleUrl: './app.css' })
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly calendarService = inject(CalendarService);
  private readonly docxGenerator = inject(DocxGeneratorService);
  readonly months = MONTHS_CATALOG;
  readonly availableYears = [2026, 2027, 2028, 2029, 2030];
  readonly selectedYear = signal(2026);
  readonly selectedMonth = signal(3);
  readonly nombre = signal('');
  readonly puesto = signal('');
  readonly isGenerating = signal(false);
  readonly lastDownloadedFile = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly aboutVisible = signal(false);
  readonly currentYear = new Date().getFullYear();
  readonly calendarSummary = computed(() => this.calendarService.buildMonthCalendar(this.selectedYear(), this.selectedMonth()));
  readonly firstHalfDays = computed(() => this.calendarSummary().days.filter((day) => day.day <= 15));
  readonly secondHalfDays = computed(() => this.calendarSummary().days.filter((day) => day.day >= 16));

  constructor() {
    const browserWindow = this.document.defaultView;
    if (browserWindow && browserWindow.location.pathname !== '/') {
      browserWindow.history.replaceState(browserWindow.history.state, '', '/');
    }
  }

  onYearChange(value: number | string): void { this.selectedYear.set(Number(value)); this.clearMessages(); }
  onMonthChange(value: number | string): void { this.selectedMonth.set(Number(value)); this.clearMessages(); }
  onRequiredFieldChange(): void { this.clearMessages(); }

  openAbout(): void { this.aboutVisible.set(true); }
  closeAbout(): void { this.aboutVisible.set(false); }

  @HostListener('document:keydown.escape')
  closeAboutWithEscape(): void {
    if (this.aboutVisible()) this.closeAbout();
  }

  async downloadWordTemplate(): Promise<void> {
    this.clearMessages();
    const nombre = this.nombre().trim();
    const puesto = this.puesto().trim();
    if (!nombre || !puesto) {
      this.errorMessage.set('Escribe el nombre completo y el puesto o área antes de descargar el documento.');
      return;
    }
    this.isGenerating.set(true);
    try {
      const summary = this.calendarSummary();
      const placeholders: DocumentPlaceholders = { nombre, puesto, mes: summary.monthName, anio: String(summary.year), ...DEFAULT_PLACEHOLDERS };
      this.lastDownloadedFile.set(await this.docxGenerator.downloadAttendanceDocx({ calendar: summary, placeholders }));
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No fue posible generar el archivo Word. Intenta nuevamente.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  private clearMessages(): void { this.errorMessage.set(null); this.lastDownloadedFile.set(null); }
}
