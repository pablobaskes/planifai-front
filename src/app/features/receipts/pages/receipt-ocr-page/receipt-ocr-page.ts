import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ReceiptLine, ReceiptLineStatus, ReceiptOcrResponse, ReceiptParseResponse } from '../../models/receipt.model';
import { ReceiptService } from '../../services/receipt.service';

@Component({
  selector: 'app-receipt-ocr-page',
  imports: [CommonModule],
  templateUrl: './receipt-ocr-page.html',
  styleUrl: './receipt-ocr-page.css',
})
export class ReceiptOcrPage {

  private static readonly allowedTypes = new Set(['image/jpeg', 'image/png']);
  protected readonly lineStatuses: ReceiptLineStatus[] = ['DRAFT', 'NEEDS_REVIEW', 'IGNORED'];

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly result = signal<ReceiptOcrResponse | null>(null);
  protected readonly draft = signal<ReceiptParseResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly parsing = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly parseError = signal<string | null>(null);

  constructor(private readonly receiptService: ReceiptService) {}

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.result.set(null);
    this.draft.set(null);
    this.error.set(null);
    this.parseError.set(null);

    if (!file) {
      this.selectedFile.set(null);
      return;
    }

    if (!ReceiptOcrPage.allowedTypes.has(file.type)) {
      this.selectedFile.set(null);
      input.value = '';
      this.error.set('Selecciona una imagen JPG o PNG.');
      return;
    }

    this.selectedFile.set(file);
  }

  protected upload(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Selecciona una imagen de ticket antes de subirla.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.parseError.set(null);
    this.result.set(null);
    this.draft.set(null);

    this.receiptService.uploadReceiptForOcr(file)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => this.result.set(response),
        error: error => this.error.set(this.resolveError(error, 'No se pudo extraer texto del ticket.')),
      });
  }

  protected parseReceipt(): void {
    const receiptId = this.result()?.receiptId;
    if (!receiptId) {
      this.parseError.set('Primero extrae el texto OCR del ticket.');
      return;
    }

    this.parsing.set(true);
    this.parseError.set(null);
    this.draft.set(null);

    this.receiptService.parseReceipt(receiptId)
      .pipe(finalize(() => this.parsing.set(false)))
      .subscribe({
        next: response => this.draft.set(response),
        error: error => this.parseError.set(this.resolveError(error, 'No se pudieron interpretar las lineas del ticket.')),
      });
  }

  protected formatOptionalNumber(value: number | null | undefined): string {
    return value === null || value === undefined ? '-' : String(value);
  }

  protected formatConfidence(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  protected isLowConfidence(line: ReceiptLine): boolean {
    return line.confidence < 0.75;
  }

  protected updateTextLine(lineId: number, field: 'rawName' | 'unit', event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    const changes: Partial<ReceiptLine> = field === 'rawName'
      ? { rawName: value }
      : { unit: value || null };
    this.updateLine(lineId, changes);
  }

  protected updateNumberLine(lineId: number, field: 'quantity' | 'unitPrice' | 'lineTotal', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateLine(lineId, { [field]: this.toOptionalNumber(value) });
  }

  protected updateLineStatus(lineId: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as ReceiptLineStatus;
    this.updateLine(lineId, {
      status,
      needsReview: status === 'NEEDS_REVIEW',
    });
  }

  private updateLine(lineId: number, changes: Partial<ReceiptLine>): void {
    this.draft.update(draft => {
      if (!draft) {
        return draft;
      }

      return {
        ...draft,
        lines: draft.lines.map(line => line.id === lineId ? { ...line, ...changes } : line),
      };
    });
  }

  private toOptionalNumber(value: string): number | null {
    if (value.trim().length === 0) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private resolveError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return fallback;
  }
}
