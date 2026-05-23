import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ReceiptOcrResponse } from '../../models/receipt.model';
import { ReceiptService } from '../../services/receipt.service';

@Component({
  selector: 'app-receipt-ocr-page',
  imports: [CommonModule],
  templateUrl: './receipt-ocr-page.html',
  styleUrl: './receipt-ocr-page.css',
})
export class ReceiptOcrPage {

  private static readonly allowedTypes = new Set(['image/jpeg', 'image/png']);

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly result = signal<ReceiptOcrResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(private readonly receiptService: ReceiptService) {}

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.result.set(null);
    this.error.set(null);

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
    this.result.set(null);

    this.receiptService.uploadReceiptForOcr(file)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => this.result.set(response),
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  private resolveError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return 'No se pudo extraer texto del ticket.';
  }
}
