import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import {
  Budget,
  BudgetAlert,
  BudgetCategoryStatus,
  BudgetRequest,
  BudgetStatus,
  BudgetSummary,
  CashflowMonth,
  CashflowResponse,
  Expense,
  ExpenseCategory,
  ExpenseCategoryBreakdown,
  ExpenseRequest,
  FinanceCategoryOption,
  FinanceCategoryStatistics,
  FinanceDashboard,
  FinancialTimelineEvent,
  FinancialTimelineEventStatus,
  FinancialTimelineEventType,
  FinancialTimelineResponse,
  FinancialHealthStatus,
  Income,
  MonthlyObligationsSummary,
  RecurringExpense,
  RecurringExpenseRecurrence,
  RecurringExpenseRequest,
  SavingsGoal,
  SavingsGoalCategory,
  SavingsGoalRequest,
  SavingsGoalStatus,
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

interface SavingsGoalForm {
  name: string;
  targetAmount: number | null;
  currentAmount: number | null;
  targetDate: string;
  category: SavingsGoalCategory;
  status: SavingsGoalStatus;
  monthlySavingRate: number | null;
  notes: string;
}

interface BudgetForm {
  category: ExpenseCategory;
  limitAmount: number | null;
  active: boolean;
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
  protected readonly budgetSummary = signal<BudgetSummary | null>(null);
  protected readonly financialTimeline = signal<FinancialTimelineResponse | null>(null);
  protected readonly cashflow = signal<CashflowResponse | null>(null);
  protected readonly budgets = signal<Budget[]>([]);
  protected readonly recurringExpenses = signal<RecurringExpense[]>([]);
  protected readonly savingsGoals = signal<SavingsGoal[]>([]);
  protected readonly financeCategories = signal<FinanceCategoryOption[]>(this.getDefaultFinanceCategories());
  protected readonly selectedMonth = signal(this.getCurrentMonth());
  protected readonly timelineFrom = signal(this.getMonthStartDate(this.selectedMonth()));
  protected readonly timelineTo = signal(this.getMonthEndDate(this.selectedMonth()));
  protected readonly cashflowFrom = signal(this.selectedMonth());
  protected readonly cashflowTo = signal(this.addMonths(this.selectedMonth(), 3));
  protected readonly loading = signal(false);
  protected readonly timelineLoading = signal(false);
  protected readonly cashflowLoading = signal(false);
  protected readonly expenseSaving = signal(false);
  protected readonly recurringLoading = signal(false);
  protected readonly recurringSaving = signal(false);
  protected readonly savingsGoalsLoading = signal(false);
  protected readonly savingsGoalSaving = signal(false);
  protected readonly budgetSaving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly timelineError = signal<string | null>(null);
  protected readonly cashflowError = signal<string | null>(null);
  protected readonly expenseError = signal<string | null>(null);
  protected readonly recurringError = signal<string | null>(null);
  protected readonly savingsGoalError = signal<string | null>(null);
  protected readonly budgetError = signal<string | null>(null);
  protected readonly editingRecurringExpenseId = signal<number | null>(null);
  protected readonly editingSavingsGoalId = signal<number | null>(null);
  protected readonly editingBudgetId = signal<number | null>(null);
  protected readonly expenseForm = signal<ExpenseForm>(this.getEmptyExpenseForm());
  protected readonly recurringForm = signal<RecurringExpenseForm>(this.getEmptyRecurringExpenseForm());
  protected readonly savingsGoalForm = signal<SavingsGoalForm>(this.getEmptySavingsGoalForm());
  protected readonly budgetForm = signal<BudgetForm>(this.getEmptyBudgetForm());
  protected readonly recurringRecurrences: RecurringExpenseRecurrence[] = ['MONTHLY', 'YEARLY'];
  protected readonly savingsGoalCategories: SavingsGoalCategory[] = [
    'EMERGENCY_FUND',
    'TRAVEL',
    'ELECTRONICS',
    'CAR',
    'HOME',
    'EDUCATION',
    'OTHER',
  ];
  protected readonly savingsGoalStatuses: SavingsGoalStatus[] = ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'];

  ngOnInit(): void {
    this.loadFinanceCategories();
    this.refreshFinance();
    this.loadRecurringExpenses();
    this.loadSavingsGoals();
  }

  protected refreshFinance(): void {
    this.loadFinance();
    this.loadFinancialTimeline();
    this.loadCashflow();
  }

  protected loadFinance(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      dashboard: this.financeService.getDashboard(this.selectedMonth()),
      categoryStatistics: this.financeService.getCategoryStatistics(this.selectedMonth()),
      obligationsSummary: this.financeService.getMonthlyObligationsSummary(this.selectedMonth()),
      budgetSummary: this.financeService.getBudgetSummary(this.selectedMonth()),
      budgets: this.financeService.getBudgets(this.selectedMonth()),
      expenses: this.financeService.getExpenses(),
      incomes: this.financeService.getIncomes(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ dashboard, categoryStatistics, obligationsSummary, budgetSummary, budgets, expenses, incomes }) => {
          this.dashboard.set(dashboard);
          this.categoryStatistics.set(categoryStatistics);
          this.obligationsSummary.set(obligationsSummary);
          this.budgetSummary.set(budgetSummary);
          this.budgets.set(budgets);
          this.expenses.set(expenses);
          this.incomes.set(incomes);
        },
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected loadFinancialTimeline(): void {
    if (!this.isValidDate(this.timelineFrom()) || !this.isValidDate(this.timelineTo())) {
      this.timelineError.set('El rango del timeline no es valido.');
      return;
    }
    if (this.timelineTo() < this.timelineFrom()) {
      this.timelineError.set('La fecha final del timeline no puede ser anterior a la fecha inicial.');
      return;
    }

    this.timelineLoading.set(true);
    this.timelineError.set(null);

    this.financeService.getFinancialTimeline(this.timelineFrom(), this.timelineTo())
      .pipe(finalize(() => this.timelineLoading.set(false)))
      .subscribe({
        next: timeline => this.financialTimeline.set({
          ...timeline,
          events: [...timeline.events].sort((left, right) =>
            left.date.localeCompare(right.date) || left.label.localeCompare(right.label),
          ),
        }),
        error: error => this.timelineError.set(this.resolveError(error, 'No se pudo cargar el timeline financiero.')),
      });
  }

  protected loadCashflow(): void {
    if (!this.isValidMonth(this.cashflowFrom()) || !this.isValidMonth(this.cashflowTo())) {
      this.cashflowError.set('El rango de cashflow no es valido.');
      return;
    }
    if (this.cashflowTo() < this.cashflowFrom()) {
      this.cashflowError.set('El mes final de cashflow no puede ser anterior al mes inicial.');
      return;
    }

    this.cashflowLoading.set(true);
    this.cashflowError.set(null);

    this.financeService.getCashflow(this.cashflowFrom(), this.cashflowTo())
      .pipe(finalize(() => this.cashflowLoading.set(false)))
      .subscribe({
        next: cashflow => this.cashflow.set(cashflow),
        error: error => this.cashflowError.set(this.resolveError(error, 'No se pudo cargar el cashflow.')),
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

  protected loadSavingsGoals(): void {
    this.savingsGoalsLoading.set(true);
    this.savingsGoalError.set(null);

    this.financeService.getSavingsGoals()
      .pipe(finalize(() => this.savingsGoalsLoading.set(false)))
      .subscribe({
        next: savingsGoals => this.savingsGoals.set(savingsGoals),
        error: error => this.savingsGoalError.set(this.resolveError(error, 'No se pudieron cargar los objetivos de ahorro.')),
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

  protected trackSavingsGoal(_index: number, savingsGoal: SavingsGoal): number {
    return savingsGoal.id;
  }

  protected trackBudget(_index: number, budget: Budget): number {
    return budget.id;
  }

  protected trackBudgetCategoryStatus(_index: number, categoryStatus: BudgetCategoryStatus): string {
    return `${categoryStatus.budgetId ?? 'category'}-${categoryStatus.category}`;
  }

  protected trackBudgetAlert(index: number, alert: BudgetAlert): string {
    return `${alert.type}-${alert.category}-${index}`;
  }

  protected trackTimelineEvent(index: number, event: FinancialTimelineEvent): string {
    return `${event.id}-${event.date}-${index}`;
  }

  protected trackCashflowMonth(_index: number, month: CashflowMonth): string {
    return month.month;
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
    this.resetBudgetForm();
    this.resetTimelineRange();
    this.resetCashflowRange();
    this.budgetError.set(null);
    this.refreshFinance();
  }

  protected onTimelineFromChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.isValidDate(input.value)) {
      input.value = this.timelineFrom();
      return;
    }
    this.timelineFrom.set(input.value);
  }

  protected onTimelineToChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.isValidDate(input.value)) {
      input.value = this.timelineTo();
      return;
    }
    this.timelineTo.set(input.value);
  }

  protected onCashflowFromChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.isValidMonth(input.value)) {
      input.value = this.cashflowFrom();
      return;
    }
    this.cashflowFrom.set(input.value);
  }

  protected onCashflowToChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.isValidMonth(input.value)) {
      input.value = this.cashflowTo();
      return;
    }
    this.cashflowTo.set(input.value);
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

  protected savingsGoalStatusLabel(status: SavingsGoalStatus): string {
    const labels: Record<SavingsGoalStatus, string> = {
      ACTIVE: 'Activo',
      COMPLETED: 'Completado',
      PAUSED: 'Pausado',
      CANCELLED: 'Cancelado',
    };

    return labels[status];
  }

  protected savingsGoalStatusClass(status: SavingsGoalStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  protected budgetStatusLabel(status: BudgetStatus): string {
    const labels: Record<BudgetStatus, string> = {
      OK: 'OK',
      WARNING: 'Atencion',
      EXCEEDED: 'Excedido',
    };

    return labels[status];
  }

  protected budgetStatusClass(status: BudgetStatus): string {
    return `status-budget-${status.toLowerCase()}`;
  }

  protected budgetAlertLabel(alert: BudgetAlert): string {
    const labels: Record<BudgetAlert['type'], string> = {
      APPROACHING_LIMIT: 'Cerca del limite',
      BUDGET_EXCEEDED: 'Presupuesto excedido',
    };

    return labels[alert.type];
  }

  protected budgetAlertClass(alert: BudgetAlert): string {
    return `budget-alert-${alert.type.toLowerCase().replace(/_/g, '-')}`;
  }

  protected budgetProgressWidth(percentage: number): number {
    if (!Number.isFinite(percentage) || percentage <= 0) {
      return 0;
    }

    return Math.min(percentage, 100);
  }

  protected timelineEventTypeLabel(type: FinancialTimelineEventType): string {
    const labels: Record<FinancialTimelineEventType, string> = {
      INCOME: 'Ingreso',
      EXPENSE: 'Gasto',
      RECURRING_EXPENSE: 'Recurrente',
      SAVINGS_GOAL: 'Objetivo',
      BUDGET_ALERT: 'Alerta',
    };

    return labels[type];
  }

  protected timelineEventStatusLabel(status: FinancialTimelineEventStatus): string {
    const labels: Record<FinancialTimelineEventStatus, string> = {
      POSTED: 'Real',
      PROJECTED: 'Proyectado',
      PENDING: 'Pendiente',
      COMPLETED: 'Completado',
      ALERT: 'Alerta',
    };

    return labels[status];
  }

  protected timelineEventTypeClass(type: FinancialTimelineEventType): string {
    return `timeline-type-${type.toLowerCase().replace(/_/g, '-')}`;
  }

  protected timelineEventStatusClass(status: FinancialTimelineEventStatus): string {
    return `status-timeline-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  protected timelineProjectionLabel(event: FinancialTimelineEvent): string {
    return event.projected ? 'Proyectado' : 'Real';
  }

  protected timelineAmountClass(event: FinancialTimelineEvent): string {
    if (event.amount > 0) {
      return 'positive';
    }
    if (event.amount < 0) {
      return 'negative';
    }
    return 'neutral';
  }

  protected cashflowAmountClass(value: number): string {
    if (value > 0) {
      return 'positive';
    }
    if (value < 0) {
      return 'negative';
    }
    return 'neutral';
  }

  protected cashflowStatusClass(month: CashflowMonth): string {
    return `cashflow-${this.cashflowAmountClass(month.netCashflow)}`;
  }

  protected cashflowStatusLabel(month: CashflowMonth): string {
    if (month.netCashflow > 0) {
      return 'Positivo';
    }
    if (month.netCashflow < 0) {
      return 'Negativo';
    }
    return 'Estable';
  }

  protected cashflowBarWidth(value: number, month: CashflowMonth): number {
    const reference = Math.max(Math.abs(month.expectedIncome), Math.abs(month.expectedExpenses));
    if (!Number.isFinite(value) || reference <= 0) {
      return 0;
    }

    return Math.min(Math.abs(value) / reference * 100, 100);
  }

  protected savingsGoalCategoryLabel(category: SavingsGoalCategory): string {
    const labels: Record<SavingsGoalCategory, string> = {
      EMERGENCY_FUND: 'Emergencia',
      TRAVEL: 'Viajes',
      ELECTRONICS: 'Electronica',
      CAR: 'Coche',
      HOME: 'Hogar',
      EDUCATION: 'Educacion',
      OTHER: 'Otros',
    };

    return labels[category];
  }

  protected savingsGoalCategoryShortCode(category: SavingsGoalCategory): string {
    const shortCodes: Record<SavingsGoalCategory, string> = {
      EMERGENCY_FUND: 'EM',
      TRAVEL: 'VI',
      ELECTRONICS: 'EL',
      CAR: 'CO',
      HOME: 'HO',
      EDUCATION: 'ED',
      OTHER: 'OT',
    };

    return shortCodes[category];
  }

  protected savingsGoalCategoryClass(category: SavingsGoalCategory): string {
    return `goal-category-${category.toLowerCase().replace(/_/g, '-')}`;
  }

  protected categoryLabel(category: ExpenseCategory): string {
    return this.categoryFriendlyLabels[category] ?? this.financeCategories().find(option => option.code === category)?.label ?? category;
  }

  protected categoryShortCode(category: ExpenseCategory): string {
    return this.categoryShortCodes[category] ?? category.slice(0, 2);
  }

  protected categoryClass(category: ExpenseCategory): string {
    return `category-${category.toLowerCase().replace('_', '-')}`;
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

  protected updateSavingsGoalForm<K extends keyof SavingsGoalForm>(
    field: K,
    value: SavingsGoalForm[K],
  ): void {
    this.savingsGoalForm.update(form => ({ ...form, [field]: value }));
  }

  protected updateBudgetForm<K extends keyof BudgetForm>(
    field: K,
    value: BudgetForm[K],
  ): void {
    this.budgetForm.update(form => ({ ...form, [field]: value }));
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
          this.refreshFinance();
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
          this.refreshFinance();
        },
        error: error => this.recurringError.set(this.resolveError(error, 'No se pudo guardar el gasto recurrente.')),
      });
  }

  protected submitSavingsGoal(): void {
    const request = this.toSavingsGoalRequest();
    if (!request) {
      return;
    }

    this.savingsGoalSaving.set(true);
    this.savingsGoalError.set(null);

    const editingId = this.editingSavingsGoalId();
    const operation = editingId === null
      ? this.financeService.createSavingsGoal(request)
      : this.financeService.updateSavingsGoal(editingId, request);

    operation
      .pipe(finalize(() => this.savingsGoalSaving.set(false)))
      .subscribe({
        next: savingsGoal => {
          if (editingId === null) {
            this.savingsGoals.update(savingsGoals => [...savingsGoals, savingsGoal]);
          } else {
            this.savingsGoals.update(savingsGoals => savingsGoals.map(item =>
              item.id === savingsGoal.id ? savingsGoal : item,
            ));
          }
          this.resetSavingsGoalForm();
        },
        error: error => this.savingsGoalError.set(this.resolveError(error, 'No se pudo guardar el objetivo de ahorro.')),
      });
  }

  protected submitBudget(): void {
    const request = this.toBudgetRequest();
    if (!request) {
      return;
    }

    this.budgetSaving.set(true);
    this.budgetError.set(null);

    const editingId = this.editingBudgetId();
    const operation = editingId === null
      ? this.financeService.createBudget(request)
      : this.financeService.updateBudget(editingId, request);

    operation
      .pipe(finalize(() => this.budgetSaving.set(false)))
      .subscribe({
        next: budget => {
          if (editingId === null) {
            this.budgets.update(budgets => [...budgets, budget]);
          } else {
            this.budgets.update(budgets => budgets.map(item =>
              item.id === budget.id ? budget : item,
            ));
          }
          this.resetBudgetForm();
          this.refreshFinance();
        },
        error: error => this.budgetError.set(this.resolveError(error, 'No se pudo guardar el presupuesto.')),
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

  protected editSavingsGoal(savingsGoal: SavingsGoal): void {
    this.editingSavingsGoalId.set(savingsGoal.id);
    this.savingsGoalError.set(null);
    this.savingsGoalForm.set({
      name: savingsGoal.name,
      targetAmount: savingsGoal.targetAmount,
      currentAmount: savingsGoal.currentAmount,
      targetDate: savingsGoal.targetDate ?? '',
      category: savingsGoal.category,
      status: savingsGoal.status,
      monthlySavingRate: savingsGoal.monthlySavingRate ?? null,
      notes: savingsGoal.notes ?? '',
    });
  }

  protected cancelSavingsGoalEdit(): void {
    this.resetSavingsGoalForm();
  }

  protected editBudget(budget: Budget): void {
    this.editingBudgetId.set(budget.id);
    this.budgetError.set(null);
    this.budgetForm.set({
      category: budget.category,
      limitAmount: budget.limitAmount,
      active: budget.active,
      notes: budget.notes ?? '',
    });
  }

  protected cancelBudgetEdit(): void {
    this.resetBudgetForm();
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
          this.refreshFinance();
        },
        error: error => this.recurringError.set(this.resolveError(error, 'No se pudo eliminar el gasto recurrente.')),
      });
  }

  protected deleteSavingsGoal(savingsGoal: SavingsGoal): void {
    this.savingsGoalSaving.set(true);
    this.savingsGoalError.set(null);

    this.financeService.deleteSavingsGoal(savingsGoal.id)
      .pipe(finalize(() => this.savingsGoalSaving.set(false)))
      .subscribe({
        next: () => {
          this.savingsGoals.update(savingsGoals =>
            savingsGoals.filter(item => item.id !== savingsGoal.id),
          );
          if (this.editingSavingsGoalId() === savingsGoal.id) {
            this.resetSavingsGoalForm();
          }
        },
        error: error => this.savingsGoalError.set(this.resolveError(error, 'No se pudo eliminar el objetivo de ahorro.')),
      });
  }

  protected deleteBudget(budget: Budget): void {
    this.budgetSaving.set(true);
    this.budgetError.set(null);

    this.financeService.deleteBudget(budget.id)
      .pipe(finalize(() => this.budgetSaving.set(false)))
      .subscribe({
        next: () => {
          this.budgets.update(budgets =>
            budgets.filter(item => item.id !== budget.id),
          );
          if (this.editingBudgetId() === budget.id) {
            this.resetBudgetForm();
          }
          this.refreshFinance();
        },
        error: error => this.budgetError.set(this.resolveError(error, 'No se pudo eliminar el presupuesto.')),
      });
  }

  protected isEditingRecurringExpense(): boolean {
    return this.editingRecurringExpenseId() !== null;
  }

  protected isEditingSavingsGoal(): boolean {
    return this.editingSavingsGoalId() !== null;
  }

  protected isEditingBudget(): boolean {
    return this.editingBudgetId() !== null;
  }

  protected isBudgetCategoryUnavailable(category: ExpenseCategory): boolean {
    const form = this.budgetForm();
    if (!form.active) {
      return false;
    }

    return this.hasActiveBudgetForCategory(category, this.editingBudgetId());
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

  private toSavingsGoalRequest(): SavingsGoalRequest | null {
    const form = this.savingsGoalForm();
    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount);
    const monthlySavingRate = form.monthlySavingRate === null || form.monthlySavingRate === undefined
      ? null
      : Number(form.monthlySavingRate);

    if (!form.name.trim()) {
      this.savingsGoalError.set('El nombre del objetivo es obligatorio.');
      return null;
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      this.savingsGoalError.set('El importe objetivo debe ser mayor que cero.');
      return null;
    }
    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      this.savingsGoalError.set('El importe actual no puede ser negativo.');
      return null;
    }
    if (currentAmount > targetAmount) {
      this.savingsGoalError.set('El importe actual no puede superar el objetivo.');
      return null;
    }
    if (monthlySavingRate !== null && (!Number.isFinite(monthlySavingRate) || monthlySavingRate < 0)) {
      this.savingsGoalError.set('El ahorro mensual no puede ser negativo.');
      return null;
    }

    return {
      name: form.name.trim(),
      targetAmount,
      currentAmount,
      targetDate: form.targetDate || null,
      category: form.category,
      status: form.status,
      monthlySavingRate,
      notes: form.notes.trim() || null,
    };
  }

  private toBudgetRequest(): BudgetRequest | null {
    const form = this.budgetForm();
    const limitAmount = Number(form.limitAmount);

    if (!this.isValidMonth(this.selectedMonth())) {
      this.budgetError.set('El mes seleccionado no es valido.');
      return null;
    }
    if (!this.financeCategories().some(option => option.code === form.category)) {
      this.budgetError.set('La categoria seleccionada no es valida.');
      return null;
    }
    if (!Number.isFinite(limitAmount) || limitAmount <= 0) {
      this.budgetError.set('El limite del presupuesto debe ser mayor que cero.');
      return null;
    }
    if (form.active && this.hasActiveBudgetForCategory(form.category, this.editingBudgetId())) {
      this.budgetError.set('Ya existe un presupuesto activo para esa categoria en el mes seleccionado.');
      return null;
    }

    return {
      month: this.selectedMonth(),
      category: form.category,
      limitAmount,
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

  private resetSavingsGoalForm(): void {
    this.editingSavingsGoalId.set(null);
    this.savingsGoalForm.set(this.getEmptySavingsGoalForm());
  }

  private resetBudgetForm(): void {
    this.editingBudgetId.set(null);
    this.budgetForm.set(this.getEmptyBudgetForm());
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

  private getEmptySavingsGoalForm(): SavingsGoalForm {
    return {
      name: '',
      targetAmount: null,
      currentAmount: 0,
      targetDate: '',
      category: 'OTHER',
      status: 'ACTIVE',
      monthlySavingRate: null,
      notes: '',
    };
  }

  private getEmptyBudgetForm(): BudgetForm {
    return {
      category: 'OTHER',
      limitAmount: null,
      active: true,
      notes: '',
    };
  }

  private getDefaultFinanceCategories(): FinanceCategoryOption[] {
    return [
      { code: 'FOOD', label: 'Alimentacion' },
      { code: 'RESTAURANTS', label: 'Restaurantes' },
      { code: 'TRANSPORT', label: 'Transporte' },
      { code: 'HEALTH', label: 'Salud' },
      { code: 'EDUCATION', label: 'Educacion' },
      { code: 'SUBSCRIPTIONS', label: 'Suscripciones' },
      { code: 'SAVINGS', label: 'Ahorro' },
      { code: 'ENTERTAINMENT', label: 'Ocio' },
      { code: 'TRAVEL', label: 'Viajes' },
      { code: 'PETS', label: 'Mascotas' },
      { code: 'OTHER', label: 'Otros' },
      { code: 'HOUSING', label: 'Vivienda' },
      { code: 'UTILITIES', label: 'Suministros' },
    ];
  }

  private readonly categoryFriendlyLabels: Record<ExpenseCategory, string> = {
    FOOD: 'Alimentacion',
    RESTAURANTS: 'Restaurantes',
    TRANSPORT: 'Transporte',
    HEALTH: 'Salud',
    EDUCATION: 'Educacion',
    SUBSCRIPTIONS: 'Suscripciones',
    SAVINGS: 'Ahorro',
    ENTERTAINMENT: 'Ocio',
    TRAVEL: 'Viajes',
    PETS: 'Mascotas',
    OTHER: 'Otros',
    HOUSING: 'Vivienda',
    UTILITIES: 'Suministros',
  };

  private readonly categoryShortCodes: Record<ExpenseCategory, string> = {
    FOOD: 'AL',
    RESTAURANTS: 'RS',
    TRANSPORT: 'TR',
    HEALTH: 'SA',
    EDUCATION: 'ED',
    SUBSCRIPTIONS: 'SU',
    SAVINGS: 'AH',
    ENTERTAINMENT: 'OC',
    TRAVEL: 'VI',
    PETS: 'MA',
    OTHER: 'OT',
    HOUSING: 'CA',
    UTILITIES: 'LU',
  };

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
    this.resetBudgetForm();
    this.resetTimelineRange();
    this.resetCashflowRange();
    this.budgetError.set(null);
    this.refreshFinance();
  }

  private isValidMonth(value: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  }

  private isValidDate(value: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value);
  }

  private resetTimelineRange(): void {
    this.timelineFrom.set(this.getMonthStartDate(this.selectedMonth()));
    this.timelineTo.set(this.getMonthEndDate(this.selectedMonth()));
    this.timelineError.set(null);
  }

  private resetCashflowRange(): void {
    this.cashflowFrom.set(this.selectedMonth());
    this.cashflowTo.set(this.addMonths(this.selectedMonth(), 3));
    this.cashflowError.set(null);
  }

  private getMonthStartDate(month: string): string {
    return `${month}-01`;
  }

  private getMonthEndDate(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    const endDate = new Date(year, monthNumber, 0);
    const day = String(endDate.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }

  private addMonths(month: string, offset: number): string {
    const [year, monthNumber] = month.split('-').map(Number);
    const nextDate = new Date(year, monthNumber - 1 + offset, 1);
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    return `${nextDate.getFullYear()}-${nextMonth}`;
  }

  private hasActiveBudgetForCategory(category: ExpenseCategory, excludedId: number | null): boolean {
    return this.budgets().some(budget =>
      budget.month === this.selectedMonth()
      && budget.category === category
      && budget.active
      && budget.id !== excludedId,
    );
  }
}
