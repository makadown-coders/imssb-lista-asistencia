import { TestBed } from '@angular/core/testing';
import { DocxGeneratorService } from './docx-generator.service';

describe('DocxGeneratorService', () => {
  it('normaliza nombres largos y caracteres no válidos para Windows', () => {
    const service = TestBed.inject(DocxGeneratorService);
    const result = service.normalizeFileNamePart('  Ángela Núñez: Área / Norte? * '.repeat(8));
    expect(result.length).toBeLessThanOrEqual(80);
    expect(result).not.toMatch(/[<>:\"/\\|?*]/);
    expect(result).toContain('Angela_Nunez');
  });
});
