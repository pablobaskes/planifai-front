import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Expense,
  FinanceDashboard,
  Income,
  MonthlyObligationsSummary,
  RecurringExpense,
  RecurringExpenseRequest,
} from '../models/finance.model';

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

  getDashboard(month: string): Observable<FinanceDashboard> {
    const params = new HttpParams().set('month', month);
    return this.http.get<FinanceDashboard>(`${this.baseUrl}/dashboard`, { params });
  }

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return this.http.get<RecurringExpense[]>(`${this.baseUrl}/recurring-expenses`);
  }

  createRecurringExpense(request: RecurringExpenseRequest): Observable<RecurringExpense> {
    return this.http.post<RecurringExpense>(`${this.baseUrl}/recurring-expenses`, request);
  }

  updateRecurringExpense(id: number, request: RecurringExpenseRequest): Observable<RecurringExpense> {
    return this.http.put<RecurringExpense>(`${this.baseUrl}/recurring-expenses/${id}`, request);
  }

  deleteRecurringExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recurring-expenses/${id}`);
  }

  getMonthlyObligationsSummary(month: string): Observable<MonthlyObligationsSummary> {
    const params = new HttpParams().set('month', month);
    return this.http.get<MonthlyObligationsSummary>(`${this.baseUrl}/obligations/monthly-summary`, { params });
  }
}
