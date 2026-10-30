import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { DocumentPlaceholders, MonthCalendarSummary } from '../models/attendance.model';

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const SHADED_DAY_HEX = 'A6A6A6'; // Gris institucional para sábados, domingos y festivos

export interface DocxGenerateOptions {
  calendar: MonthCalendarSummary;
  placeholders: DocumentPlaceholders;
  showHolidayNameInObservations?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DocxGeneratorService {
  private templateBufferCache: ArrayBuffer | null = null;

  /**
   * Carga el archivo base `template-membretado-2026.docx` desde `public/`.
   */
  private async loadTemplateBuffer(): Promise<ArrayBuffer> {
    if (this.templateBufferCache) {
      return this.templateBufferCache;
    }
    const response = await fetch('template-membretado-2026.docx');
    if (!response.ok) {
      throw new Error(
        `No se pudo cargar la plantilla base (HTTP ${response.status})`
      );
    }
    this.templateBufferCache = await response.arrayBuffer();
    return this.templateBufferCache;
  }

  /**
   * Genera el archivo Word (.docx) modificado de acuerdo con el mes, año,
   * fines de semana y días festivos calculados.
   */
  async generateAttendanceDocx(options: DocxGenerateOptions): Promise<Blob> {
    const buffer = await this.loadTemplateBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      throw new Error('El archivo plantilla no contiene word/document.xml');
    }

    const docXmlStr = await docXmlFile.async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXmlStr, 'application/xml');

    const tables = xmlDoc.getElementsByTagNameNS(W_NS, 'tbl');
    if (tables.length < 2) {
      throw new Error('Estructura de tablas no válida en la plantilla Word');
    }

    const metadataTable = tables[0];
    const daysTable = tables[1];

    // 1. Actualizar Tabla 0 (Datos de encabezado: Nombre, Puesto, Mes, Año)
    this.updateMetadataTable(metadataTable, options.placeholders);

    // 2. Actualizar Tabla 1 (Filas de días 1..31, recortar meses cortos y sombrear inhábiles)
    this.updateDaysTable(
      xmlDoc,
      daysTable,
      options.calendar,
      Boolean(options.showHolidayNameInObservations)
    );

    const serializer = new XMLSerializer();
    const updatedDocXml = serializer.serializeToString(xmlDoc);
    zip.file('word/document.xml', updatedDocXml);

    return zip.generateAsync({
      type: 'blob',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
    });
  }

  /**
   * Descarga directamente el Blob `.docx` en el navegador del usuario.
   */
  async downloadAttendanceDocx(options: DocxGenerateOptions): Promise<string> {
    const blob = await this.generateAttendanceDocx(options);
    const fileName = `Lista_Asistencia_${options.calendar.monthName}_${options.calendar.year}.docx`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 3000);

    return fileName;
  }

  private updateMetadataTable(
    tableEl: Element,
    placeholders: DocumentPlaceholders
  ): void {
    const rows = this.getDirectChildrenByTagName(tableEl, 'tr');
    if (rows.length < 3) {
      return;
    }

    // Fila 0: [Nombre:, VALOR_NOMBRE, Mes:, VALOR_MES, Año:, VALOR_ANIO]
    const row0Cells = this.getDirectChildrenByTagName(rows[0], 'tc');
    if (row0Cells.length >= 6) {
      this.setCellText(row0Cells[1], placeholders.nombre);
      this.setCellText(row0Cells[3], placeholders.mes);
      this.setCellText(row0Cells[5], placeholders.anio);
    }

    // Fila 1: [Puesto:, VALOR_PUESTO, Jornada:/Horario:, LUNES A VIERNES / 08:00 - 17:00 HRS]
    const row1Cells = this.getDirectChildrenByTagName(rows[1], 'tc');
    if (row1Cells.length >= 2) {
      this.setCellText(row1Cells[1], placeholders.puesto);
    }

    // Fila 2: [Adscripción:, VALOR_ADSCRIPCION]
    const row2Cells = this.getDirectChildrenByTagName(rows[2], 'tc');
    if (row2Cells.length >= 2) {
      this.setCellText(row2Cells[1], placeholders.adscripcion);
    }
  }

  private updateDaysTable(
    xmlDoc: Document,
    tableEl: Element,
    calendar: MonthCalendarSummary,
    showHolidayNameInObservations: boolean
  ): void {
    const rows = this.getDirectChildrenByTagName(tableEl, 'tr');
    // Estructura de Tabla 1 en template-membretado-2026.docx:
    // Row 0: Encabezado (DÍA | HORA DE ENTRADA | ...)
    // Rows 1..15: Días 1 al 15
    // Row 16: Segundo Encabezado (DÍA | HORA DE ENTRADA | ...)
    // Rows 17..32: Días 16 al 31

    const dayInfoByNumber = new Map(calendar.days.map((d) => [d.day, d]));

    for (let rIdx = 1; rIdx < rows.length; rIdx++) {
      if (rIdx === 16) {
        // Es el segundo encabezado intermedio; lo conservamos intacto
        continue;
      }

      const dayNumber = rIdx < 16 ? rIdx : rIdx - 1;
      const rowEl = rows[rIdx];

      // Si el día excede los días reales del mes (ej. 29, 30, 31 en febrero), eliminamos la fila
      if (dayNumber > calendar.daysInMonth) {
        tableEl.removeChild(rowEl);
        continue;
      }

      const dayInfo = dayInfoByNumber.get(dayNumber);
      if (!dayInfo) {
        continue;
      }

      const cells = this.getDirectChildrenByTagName(rowEl, 'tc');
      for (const cell of cells) {
        if (dayInfo.isShaded) {
          this.setCellShading(xmlDoc, cell, SHADED_DAY_HEX);
        } else {
          this.removeCellShading(cell);
        }
      }

      // Opcional: escribir el nombre del día festivo en la columna OBSERVACIONES (celda índice 5)
      if (cells.length >= 6) {
        if (showHolidayNameInObservations && dayInfo.isHoliday && dayInfo.holidayName) {
          this.setCellText(cells[5], dayInfo.holidayName.toUpperCase());
        } else {
          this.setCellText(cells[5], '\u00A0');
        }
      }
    }
  }

  private setCellShading(
    xmlDoc: Document,
    cellEl: Element,
    hexColor: string
  ): void {
    let tcPr = this.getDirectChildrenByTagName(cellEl, 'tcPr')[0];
    if (!tcPr) {
      tcPr = xmlDoc.createElementNS(W_NS, 'w:tcPr');
      cellEl.insertBefore(tcPr, cellEl.firstChild);
    }

    let shd = this.getDirectChildrenByTagName(tcPr, 'shd')[0];
    if (!shd) {
      shd = xmlDoc.createElementNS(W_NS, 'w:shd');
      // Insertar antes de w:vAlign o w:hideMark para respetar el orden del esquema OpenXML CT_TcPr
      const vAlign = this.getDirectChildrenByTagName(tcPr, 'vAlign')[0];
      const hideMark = this.getDirectChildrenByTagName(tcPr, 'hideMark')[0];
      const refNode = vAlign || hideMark || null;
      tcPr.insertBefore(shd, refNode);
    }

    shd.setAttributeNS(W_NS, 'w:val', 'clear');
    shd.setAttributeNS(W_NS, 'w:color', 'auto');
    shd.setAttributeNS(W_NS, 'w:fill', hexColor);
  }

  private removeCellShading(cellEl: Element): void {
    const tcPr = this.getDirectChildrenByTagName(cellEl, 'tcPr')[0];
    if (!tcPr) {
      return;
    }
    const shd = this.getDirectChildrenByTagName(tcPr, 'shd')[0];
    if (shd) {
      tcPr.removeChild(shd);
    }
  }

  private setCellText(cellEl: Element, newText: string): void {
    const textNodes = cellEl.getElementsByTagNameNS(W_NS, 't');
    if (textNodes.length > 0) {
      textNodes[0].textContent = newText;
      for (let i = 1; i < textNodes.length; i++) {
        textNodes[i].textContent = '';
      }
    }
  }

  private getDirectChildrenByTagName(
    parent: Element,
    localName: string
  ): Element[] {
    const result: Element[] = [];
    for (let i = 0; i < parent.childNodes.length; i++) {
      const node = parent.childNodes[i];
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.localName === localName) {
          result.push(el);
        }
      }
    }
    return result;
  }
}
