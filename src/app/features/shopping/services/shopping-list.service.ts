import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ShoppingList } from '../models/shopping-list.model';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {

  private readonly baseUrl = `${environment.apiUrl}/shopping-lists`;

  constructor(private readonly http: HttpClient) {}

  generateCurrent(dietId: number): Observable<ShoppingList> {
    return this.http.post<ShoppingList>(
      `${environment.apiUrl}/diets/${dietId}/shopping-lists/generate`,
      null
    );
  }

  getCurrent(): Observable<ShoppingList> {
    return this.http.get<ShoppingList>(`${this.baseUrl}/current`);
  }

  purchaseItem(itemId: number): Observable<ShoppingList> {
    return this.http.patch<ShoppingList>(`${this.baseUrl}/items/${itemId}/purchase`, null);
  }

  purchaseAll(): Observable<ShoppingList> {
    return this.http.patch<ShoppingList>(`${this.baseUrl}/purchase-all`, null);
  }
}
