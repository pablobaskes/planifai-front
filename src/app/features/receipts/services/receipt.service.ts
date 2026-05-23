import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ReceiptOcrResponse } from '../models/receipt.model';

@Injectable({ providedIn: 'root' })
export class ReceiptService {

  private readonly ocrUrl = `${environment.apiUrl}/receipts/ocr`;

  constructor(private readonly http: HttpClient) {}

  uploadReceiptForOcr(file: File): Observable<ReceiptOcrResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ReceiptOcrResponse>(this.ocrUrl, formData);
  }
}
