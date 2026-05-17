import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { Expense, Income } from '../../models/finance.model';
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
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFinance();
  }

  protected loadFinance(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      expenses: this.financeService.getExpenses(),
      incomes: this.financeService.getIncomes(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ expenses, incomes }) => {
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
}
