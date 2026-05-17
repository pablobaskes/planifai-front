import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import {
  Expense,
  ExpenseCategoryBreakdown,
  FinanceDashboard,
  FinancialHealthStatus,
  Income,
} from '../../models/finance.model';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-finance-page',
  imports: [CommonModule],
  templateUrl: './finance-page.html',
  styleUrl: './finance-page.css',
})
export class FinancePage implements OnInit {

  private readonly financeService = inject(FinanceService);

  protected readonly expenses = signal<Expense[]>([]);
  protected readonly incomes = signal<Income[]>([]);
  protected readonly dashboard = signal<FinanceDashboard | null>(null);
  protected readonly selectedMonth = signal(this.getCurrentMonth());
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFinance();
  }

  protected loadFinance(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      dashboard: this.financeService.getDashboard(this.selectedMonth()),
      expenses: this.financeService.getExpenses(),
      incomes: this.financeService.getIncomes(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ dashboard, expenses, incomes }) => {
          this.dashboard.set(dashboard);
          this.expenses.set(expenses);
          this.incomes.set(incomes);
        },
        error: error => this.error.set(this.resolveError(error)),
      });
  }

  protected trackExpense(_index: number, expense: Expense): number {
    return expense.id;
  }

  protected trackIncome(_index: number, income: Income): number {
    return income.id;
  }

  protected trackCategoryBreakdown(_index: number, breakdown: ExpenseCategoryBreakdown): string {
    return breakdown.category;
  }

  protected onMonthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.value || input.value === this.selectedMonth()) {
      return;
    }

    this.selectedMonth.set(input.value);
    this.loadFinance();
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

  private resolveError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    return 'No se pudo cargar la informacion financiera.';
  }

  private getCurrentMonth(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${month}`;
  }
}
