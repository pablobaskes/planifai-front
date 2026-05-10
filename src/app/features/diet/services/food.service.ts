import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Food } from '../models/food.model';

@Injectable({ providedIn: 'root' })
export class FoodService {

  private readonly baseUrl = `${environment.apiUrl}/foods`;

  constructor(private readonly http: HttpClient) {}

  getAllFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(this.baseUrl);
  }
}
