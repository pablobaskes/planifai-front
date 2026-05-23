import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Budget,
  BudgetRequest,
  BudgetSummary,
  CashflowResponse,
  Expense,
  ExpenseCategory,
  ExpenseRequest,
  FinanceCategoryOption,
  FinanceCategoryStatistics,
  FinanceDashboard,
  FinancialTimelineResponse,
  Income,
  MonthlyObligationsSummary,
  RecurringExpense,
  RecurringExpenseRequest,
  SavingsGoal,
  SavingsGoalRequest,
  SavingsGoalSummary,
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

  getFinancialTimeline(from: string, to: string): Observable<FinancialTimelineResponse> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    return this.http.get<FinancialTimelineResponse>(`${this.baseUrl}/timeline`, { params });
  }

  getCashflow(from: string, to: string): Observable<CashflowResponse> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    return this.http.get<CashflowResponse>(`${this.baseUrl}/cashflow`, { params });
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

  getBudgets(month: string): Observable<Budget[]> {
    const params = new HttpParams().set('month', month);
    return this.http.get<Budget[]>(`${this.baseUrl}/budgets`, { params });
  }

  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.baseUrl}/budgets/${id}`);
  }

  createBudget(request: BudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(`${this.baseUrl}/budgets`, request);
  }

  updateBudget(id: number, request: BudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.baseUrl}/budgets/${id}`, request);
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/budgets/${id}`);
  }

  getBudgetSummary(month: string): Observable<BudgetSummary> {
    const params = new HttpParams().set('month', month);
    return this.http.get<BudgetSummary>(`${this.baseUrl}/budgets/summary`, { params });
  }

  getSavingsGoals(): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(`${this.baseUrl}/savings-goals`);
  }

  getSavingsGoal(id: number): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.baseUrl}/savings-goals/${id}`);
  }

  createSavingsGoal(request: SavingsGoalRequest): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${this.baseUrl}/savings-goals`, request);
  }

  updateSavingsGoal(id: number, request: SavingsGoalRequest): Observable<SavingsGoal> {
    return this.http.put<SavingsGoal>(`${this.baseUrl}/savings-goals/${id}`, request);
  }

  deleteSavingsGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/savings-goals/${id}`);
  }

  getSavingsGoalsSummary(): Observable<SavingsGoalSummary> {
    return this.http.get<SavingsGoalSummary>(`${this.baseUrl}/savings-goals/summary`);
  }
}
