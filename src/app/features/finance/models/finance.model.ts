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

export type RecurringExpenseRecurrence = 'MONTHLY' | 'YEARLY';

export type FinancialHealthStatus = 'GOOD' | 'WARNING' | 'BAD' | 'NO_DATA';

export type ObligationPaymentStatus = 'PENDING' | 'PAID_OR_REGISTERED';

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

export interface RecurringExpenseRequest {
  name: string;
  amount: number;
  category: ExpenseCategory;
  recurrence: RecurringExpenseRecurrence;
  paymentDay: number;
  startDate: string;
  endDate?: string | null;
  active: boolean;
  notes?: string | null;
}

export interface RecurringExpense extends RecurringExpenseRequest {
  id: number;
}

export interface UpcomingPayment {
  recurringExpenseId: number;
  name: string;
  amount: number;
  category: ExpenseCategory;
  dueDate: string;
  paymentDay: number;
  status: ObligationPaymentStatus;
}

export interface MonthlyObligationsSummary {
  month: string;
  totalRecurringObligations: number;
  pendingObligations: number;
  paidOrRegisteredObligations: number;
  realAvailableMoney: number;
  upcomingPayments: UpcomingPayment[];
}
