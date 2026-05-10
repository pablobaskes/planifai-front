import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { InventoryItem, InventoryItemRequest, StorageLocation } from '../models/inventory-item.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {

  private readonly baseUrl = `${environment.apiUrl}/inventory`;

  constructor(private readonly http: HttpClient) {}

  getAll(location?: StorageLocation): Observable<InventoryItem[]> {
    const options = location
      ? { params: new HttpParams().set('location', location) }
      : {};

    return this.http.get<InventoryItem[]>(this.baseUrl, options);
  }

  create(request: InventoryItemRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.baseUrl, request);
  }

  update(itemId: number, request: InventoryItemRequest): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.baseUrl}/${itemId}`, request);
  }

  delete(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${itemId}`);
  }
}
