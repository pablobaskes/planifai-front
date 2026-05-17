export type ExpenseCategory =
  | 'MORTGAGE'
  | 'RENTAL_PROPERTY'
  | 'UTILITIES'
  | 'GROCERIES'
  | 'TRANSPORT'
  | 'HEALTH'
  | 'LEISURE'
  | 'TAXES'
  | 'OTHER';

export type IncomeCategory =
  | 'SALARY'
  | 'RENTAL_INCOME'
  | 'FREELANCE'
  | 'INVESTMENT'
  | 'OTHER';

export type Recurrence = 'ONE_OFF' | 'MONTHLY' | 'YEARLY';

export type FinancialHealthStatus = 'GOOD' | 'WARNING' | 'BAD' | 'NO_DATA';

export interface Expense {
  id: number;
  concept: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategory;
  recurrence: Recurrence;
  notes?: string | null;
}

export interface Income {
  id: number;
  source: string;
  amount: number;
  incomeDate: string;
  category: IncomeCategory;
  recurrence: Recurrence;
  notes?: string | null;
}

export interface ExpenseCategoryBreakdown {
  category: ExpenseCategory;
  totalAmount: number;
  percentage: number;
}

export interface FinanceDashboard {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsAmount: number;
  savingsRate: number;
  healthStatus: FinancialHealthStatus;
  expensesByCategory: ExpenseCategoryBreakdown[];
}
