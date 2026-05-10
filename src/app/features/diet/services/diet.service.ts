import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diet, DietRequest } from '../models/diet.model';
import { MealSlot } from '../models/meal-slot.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DietService {

  private readonly baseUrl = `${environment.apiUrl}/diets`;

  constructor(private http: HttpClient) {}

  createDiet(request: DietRequest): Observable<Diet> {
    return this.http.post<Diet>(this.baseUrl, request);
  }

  getDietsByDateRange(from: string, to: string): Observable<Diet[]> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    return this.http.get<Diet[]>(`${this.baseUrl}/range`, { params });
  }

  overrideMealSlotRecipe(slotId: number, recipeId: number): Observable<MealSlot> {
    return this.http.patch<MealSlot>(`${environment.apiUrl}/meal-slots/${slotId}/recipe`, { recipeId });
  }
}
