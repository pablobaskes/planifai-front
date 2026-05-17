import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Expense, Income } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {

  private readonly baseUrl = `${environment.coreApiUrl}/finance`;

  constructor(private readonly http: HttpClient) {}

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.baseUrl}/expenses`);
  }

  getIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.baseUrl}/incomes`);
  }
}
