import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Expense,
  ExpenseCategory,
  ExpenseRequest,
  FinanceCategoryOption,
  FinanceCategoryStatistics,
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

  getExpenses(category?: ExpenseCategory): Observable<Expense[]> {
    const params = category ? new HttpParams().set('category', category) : undefined;
    return this.http.get<Expense[]>(`${this.baseUrl}/expenses`, { params });
  }

  createExpense(request: ExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, request);
  }

  getIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.baseUrl}/incomes`);
  }

  getDashboard(month: string): Observable<FinanceDashboard> {
    const params = new HttpParams().set('month', month);
    return this.http.get<FinanceDashboard>(`${this.baseUrl}/dashboard`, { params });
  }

  getFinanceCategories(): Observable<FinanceCategoryOption[]> {
    return this.http.get<FinanceCategoryOption[]>(`${this.baseUrl}/categories`);
  }

  getCategoryStatistics(month: string): Observable<FinanceCategoryStatistics> {
    const params = new HttpParams().set('month', month);
    return this.http.get<FinanceCategoryStatistics>(`${this.baseUrl}/statistics/categories`, { params });
  }

  getRecurringExpenses(category?: ExpenseCategory): Observable<RecurringExpense[]> {
    const params = category ? new HttpParams().set('category', category) : undefined;
    return this.http.get<RecurringExpense[]>(`${this.baseUrl}/recurring-expenses`, { params });
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
