import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import {
  Expense,
  ExpenseCategory,
  ExpenseCategoryBreakdown,
  ExpenseRequest,
  FinanceCategoryOption,
  FinanceCategoryStatistics,
  FinanceDashboard,
  FinancialHealthStatus,
  Income,
  MonthlyObligationsSummary,
  RecurringExpense,
  RecurringExpenseRecurrence,
  RecurringExpenseRequest,
  UpcomingPayment,
} from '../../models/finance.model';
import { FinanceService } from '../../services/finance.service';

interface RecurringExpenseForm {
  name: string;
  amount: number | null;
  category: ExpenseCategory;
  recurrence: RecurringExpenseRecurrence;
  paymentDay: number | null;
  startDate: string;
  endDate: string;
  active: boolean;
  notes: string;
}

interface ExpenseForm {
  concept: string;
  amount: number | null;
  category: ExpenseCategory;
  expenseDate: string;
  notes: string;
}

@Component({
  selector: 'app-finance-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-page.html',
  styleUrl: './finance-page.css',
})
export class FinancePage implements OnInit {

  private readonly financeService = inject(FinanceService);

  protected readonly expenses = signal<Expense[]>([]);
  protected readonly incomes = signal<Income[]>([]);
  protected readonly dashboard = signal<FinanceDashboard | null>(null);
  protected readonly categoryStatistics = signal<FinanceCategoryStatistics | null>(null);
  protected readonly obligationsSummary = signal<MonthlyObligationsSummary | null>(null);
  protected readonly recurringExpenses = signal<RecurringExpense[]>([]);
  protected readonly financeCategories = signal<FinanceCategoryOption[]>(this.getDefaultFinanceCategories());
  protected readonly selectedMonth = signal(this.getCurrentMonth());
  protected readonly loading = signal(false);
  protected readonly expenseSaving = signal(false);
  protected readonly recurringLoading = signal(false);
  protected readonly recurringSaving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly expenseError = signal<string | null>(null);
  protected readonly recurringError = signal<string | null>(null);
  protected readonly editingRecurringExpenseId = signal<number | null>(null);
  protected readonly expenseForm = signal<ExpenseForm>(this.getEmptyExpenseForm());
  protected readonly recurringForm = signal<RecurringExpenseForm>(this.getEmptyRecurringExpenseForm());
  protected readonly recurringRecurrences: RecurringExpenseRecurrence[] = ['MONTHLY', 'YEARLY'];

  ngOnInit(): void {
    this.loadFinanceCategories();
    this.loadFinance();
    this.loadRecurringExpenses();
  }

  protected loadFinance(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      dashboard: this.financeService.getDashboard(this.selectedMonth()),
      categoryStatistics: this.financeService.getCategoryStatistics(this.selectedMonth()),
      obligationsSummary: this.financeService.getMonthlyObligationsSummary(this.selectedMonth()),
      expenses: this.financeService.getExpenses(),
      incomes: this.financeService.getIncomes(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ dashboard, categoryStatistics, obligationsSummary, expenses, incomes }) => {
          this.dashboard.set(dashboard);
          this.categoryStatistics.set(categoryStatistics);
          this.obligationsSummary.set(obligationsSummary);
          this.expenses.set(expenses);
          this.incomes.set(incomes);
        },
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected loadFinanceCategories(): void {
    this.financeService.getFinanceCategories()
      .subscribe({
        next: categories => {
          if (categories.length > 0) {
            this.financeCategories.set(categories);
          }
        },
      });
  }

  protected loadRecurringExpenses(): void {
    this.recurringLoading.set(true);
    this.recurringError.set(null);

    this.financeService.getRecurringExpenses()
      .pipe(finalize(() => this.recurringLoading.set(false)))
      .subscribe({
        next: recurringExpenses => this.recurringExpenses.set(recurringExpenses),
        error: error => this.recurringError.set(this.resolveError(error, 'No se pudieron cargar los gastos recurrentes.')),
      });
  }

  protected trackExpense(_index: number, expense: Expense): number {
    return expense.id;
  }

  protected trackIncome(_index: number, income: Income): number {
    return income.id;
  }

  protected trackRecurringExpense(_index: number, recurringExpense: RecurringExpense): number {
    return recurringExpense.id;
  }

  protected trackCategoryBreakdown(_index: number, breakdown: ExpenseCategoryBreakdown): string {
    return breakdown.category;
  }

  protected trackCategoryStatistic(_index: number, statistic: FinanceCategoryStatistics['categories'][number]): string {
    return statistic.category;
  }

  protected trackUpcomingPayment(_index: number, payment: UpcomingPayment): number {
    return payment.recurringExpenseId;
  }

  protected onMonthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.isValidMonth(input.value)) {
      input.value = this.selectedMonth();
      return;
    }

    if (input.value === this.selectedMonth()) {
      return;
    }

    this.selectedMonth.set(input.value);
    this.loadFinance();
  }

  protected goToPreviousMonth(): void {
    this.moveMonth(-1);
  }

  protected goToNextMonth(): void {
    this.moveMonth(1);
  }

  protected isEmptyDashboard(dashboard: FinanceDashboard | null): boolean {
    return !!dashboard
      && dashboard.totalIncome === 0
      && dashboard.totalExpenses === 0
      && dashboard.netBalance === 0
      && dashboard.expensesByCategory.length === 0;
  }

  protected healthLabel(status: FinancialHealthStatus): string {
    const labels: Record<FinancialHealthStatus, string> = {
      GOOD: 'Buena',
      WARNING: 'Atencion',
      BAD: 'Riesgo',
      NO_DATA: 'Sin datos',
    };

    return labels[status];
  }

  protected healthDescription(status: FinancialHealthStatus): string {
    const descriptions: Record<FinancialHealthStatus, string> = {
      GOOD: 'El mes mantiene ahorro positivo y saludable.',
      WARNING: 'El mes no esta en negativo, pero el ahorro es bajo.',
      BAD: 'El mes tiene balance negativo.',
      NO_DATA: 'No hay datos suficientes para evaluar el mes.',
    };

    return descriptions[status];
  }

  protected healthClass(status: FinancialHealthStatus): string {
    return `health-${status.toLowerCase().replace('_', '-')}`;
  }

  protected obligationStatusLabel(status: UpcomingPayment['status']): string {
    const labels: Record<UpcomingPayment['status'], string> = {
      PENDING: 'Pendiente',
      PAID_OR_REGISTERED: 'Registrado',
    };

    return labels[status];
  }

  protected obligationStatusClass(status: UpcomingPayment['status']): string {
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  protected categoryLabel(category: ExpenseCategory): string {
    return this.financeCategories().find(option => option.code === category)?.label ?? category;
  }

  protected updateExpenseForm<K extends keyof ExpenseForm>(
    field: K,
    value: ExpenseForm[K],
  ): void {
    this.expenseForm.update(form => ({ ...form, [field]: value }));
  }

  protected updateRecurringForm<K extends keyof RecurringExpenseForm>(
    field: K,
    value: RecurringExpenseForm[K],
  ): void {
    this.recurringForm.update(form => ({ ...form, [field]: value }));
  }

  protected submitExpense(): void {
    const request = this.toExpenseRequest();
    if (!request) {
      return;
    }

    this.expenseSaving.set(true);
    this.expenseError.set(null);

    this.financeService.createExpense(request)
      .pipe(finalize(() => this.expenseSaving.set(false)))
      .subscribe({
        next: expense => {
          this.expenses.update(expenses => [...expenses, expense]);
          this.resetExpenseForm();
          this.loadFinance();
        },
        error: error => this.expenseError.set(this.resolveError(error, 'No se pudo guardar el gasto.')),
      });
  }

  protected submitRecurringExpense(): void {
    const request = this.toRecurringExpenseRequest();
    if (!request) {
      return;
    }

    this.recurringSaving.set(true);
    this.recurringError.set(null);

    const editingId = this.editingRecurringExpenseId();
    const operation = editingId === null
      ? this.financeService.createRecurringExpense(request)
      : this.financeService.updateRecurringExpense(editingId, request);

    operation
      .pipe(finalize(() => this.recurringSaving.set(false)))
      .subscribe({
        next: recurringExpense => {
          if (editingId === null) {
            this.recurringExpenses.update(recurringExpenses => [...recurringExpenses, recurringExpense]);
          } else {
            this.recurringExpenses.update(recurringExpenses => recurringExpenses.map(item =>
              item.id === recurringExpense.id ? recurringExpense : item,
            ));
          }
          this.resetRecurringForm();
          this.loadFinance();
        },
        error: error => this.recurringError.set(this.resolveError(error, 'No se pudo guardar el gasto recurrente.')),
      });
  }

  protected editRecurringExpense(recurringExpense: RecurringExpense): void {
    this.editingRecurringExpenseId.set(recurringExpense.id);
    this.recurringError.set(null);
    this.recurringForm.set({
      name: recurringExpense.name,
      amount: recurringExpense.amount,
      category: recurringExpense.category,
      recurrence: recurringExpense.recurrence,
      paymentDay: recurringExpense.paymentDay,
      startDate: recurringExpense.startDate,
      endDate: recurringExpense.endDate ?? '',
      active: recurringExpense.active,
      notes: recurringExpense.notes ?? '',
    });
  }

  protected cancelRecurringExpenseEdit(): void {
    this.resetRecurringForm();
  }

  protected deleteRecurringExpense(recurringExpense: RecurringExpense): void {
    this.recurringSaving.set(true);
    this.recurringError.set(null);

    this.financeService.deleteRecurringExpense(recurringExpense.id)
      .pipe(finalize(() => this.recurringSaving.set(false)))
      .subscribe({
        next: () => {
          this.recurringExpenses.update(recurringExpenses =>
            recurringExpenses.filter(item => item.id !== recurringExpense.id),
          );
          if (this.editingRecurringExpenseId() === recurringExpense.id) {
            this.resetRecurringForm();
          }
          this.loadFinance();
        },
        error: error => this.recurringError.set(this.resolveError(error, 'No se pudo eliminar el gasto recurrente.')),
      });
  }

  protected isEditingRecurringExpense(): boolean {
    return this.editingRecurringExpenseId() !== null;
  }

  private resolveError(error: unknown, fallback = 'No se pudo cargar la informacion financiera.'): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return fallback;
  }

  private toRecurringExpenseRequest(): RecurringExpenseRequest | null {
    const form = this.recurringForm();
    const amount = Number(form.amount);
    const paymentDay = Number(form.paymentDay);

    if (!form.name.trim()) {
      this.recurringError.set('El nombre del gasto recurrente es obligatorio.');
      return null;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      this.recurringError.set('El importe debe ser mayor que cero.');
      return null;
    }
    if (!Number.isInteger(paymentDay) || paymentDay < 1 || paymentDay > 31) {
      this.recurringError.set('El dia de pago debe estar entre 1 y 31.');
      return null;
    }
    if (!form.startDate) {
      this.recurringError.set('La fecha de inicio es obligatoria.');
      return null;
    }
    if (form.endDate && form.endDate < form.startDate) {
      this.recurringError.set('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return null;
    }

    return {
      name: form.name.trim(),
      amount,
      category: form.category,
      recurrence: form.recurrence,
      paymentDay,
      startDate: form.startDate,
      endDate: form.endDate || null,
      active: form.active,
      notes: form.notes.trim() || null,
    };
  }

  private toExpenseRequest(): ExpenseRequest | null {
    const form = this.expenseForm();
    const amount = Number(form.amount);

    if (!form.concept.trim()) {
      this.expenseError.set('El concepto del gasto es obligatorio.');
      return null;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      this.expenseError.set('El importe debe ser mayor que cero.');
      return null;
    }
    if (!form.expenseDate) {
      this.expenseError.set('La fecha del gasto es obligatoria.');
      return null;
    }
    if (!this.financeCategories().some(option => option.code === form.category)) {
      this.expenseError.set('La categoria seleccionada no es valida.');
      return null;
    }

    return {
      concept: form.concept.trim(),
      amount,
      expenseDate: form.expenseDate,
      category: form.category,
      recurrence: 'ONE_OFF',
      notes: form.notes.trim() || null,
    };
  }

  private resetExpenseForm(): void {
    this.expenseForm.set(this.getEmptyExpenseForm());
  }

  private resetRecurringForm(): void {
    this.editingRecurringExpenseId.set(null);
    this.recurringForm.set(this.getEmptyRecurringExpenseForm());
  }

  private getEmptyRecurringExpenseForm(): RecurringExpenseForm {
    return {
      name: '',
      amount: null,
      category: 'OTHER',
      recurrence: 'MONTHLY',
      paymentDay: 1,
      startDate: this.todayAsDateInputValue(),
      endDate: '',
      active: true,
      notes: '',
    };
  }

  private getEmptyExpenseForm(): ExpenseForm {
    return {
      concept: '',
      amount: null,
      category: 'OTHER',
      expenseDate: this.todayAsDateInputValue(),
      notes: '',
    };
  }

  private getDefaultFinanceCategories(): FinanceCategoryOption[] {
    return [
      { code: 'FOOD', label: 'Food' },
      { code: 'RESTAURANTS', label: 'Restaurants' },
      { code: 'TRANSPORT', label: 'Transport' },
      { code: 'HEALTH', label: 'Health' },
      { code: 'EDUCATION', label: 'Education' },
      { code: 'SUBSCRIPTIONS', label: 'Subscriptions' },
      { code: 'SAVINGS', label: 'Savings' },
      { code: 'ENTERTAINMENT', label: 'Entertainment' },
      { code: 'TRAVEL', label: 'Travel' },
      { code: 'PETS', label: 'Pets' },
      { code: 'OTHER', label: 'Other' },
      { code: 'HOUSING', label: 'Housing' },
      { code: 'UTILITIES', label: 'Utilities' },
    ];
  }

  private getCurrentMonth(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${month}`;
  }

  private todayAsDateInputValue(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }

  private moveMonth(offset: number): void {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const nextDate = new Date(year, month - 1 + offset, 1);
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    this.selectedMonth.set(`${nextDate.getFullYear()}-${nextMonth}`);
    this.loadFinance();
  }

  private isValidMonth(value: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  }
}
