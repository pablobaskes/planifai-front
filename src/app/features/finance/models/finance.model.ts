export type FinanceCategory =
  | 'FOOD'
  | 'RESTAURANTS'
  | 'TRANSPORT'
  | 'HEALTH'
  | 'EDUCATION'
  | 'SUBSCRIPTIONS'
  | 'SAVINGS'
  | 'ENTERTAINMENT'
  | 'TRAVEL'
  | 'PETS'
  | 'OTHER'
  | 'HOUSING'
  | 'UTILITIES';

export type ExpenseCategory = FinanceCategory;

export type IncomeCategory =
  | 'SALARY'
  | 'RENTAL_INCOME'
  | 'FREELANCE'
  | 'INVESTMENT'
  | 'SAVINGS'
  | 'OTHER';

export type Recurrence = 'ONE_OFF' | 'MONTHLY' | 'YEARLY';

export type RecurringExpenseRecurrence = 'MONTHLY' | 'YEARLY';

export type FinancialHealthStatus = 'GOOD' | 'WARNING' | 'BAD' | 'NO_DATA';

export type ObligationPaymentStatus = 'PENDING' | 'PAID_OR_REGISTERED';

export type SavingsGoalCategory =
  | 'EMERGENCY_FUND'
  | 'TRAVEL'
  | 'ELECTRONICS'
  | 'CAR'
  | 'HOME'
  | 'EDUCATION'
  | 'OTHER';

export type SavingsGoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export interface Expense {
  id: number;
  concept: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategory;
  recurrence: Recurrence;
  notes?: string | null;
}

export interface ExpenseRequest {
  concept: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategory;
  recurrence?: Recurrence | null;
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

export interface FinanceCategoryOption {
  code: FinanceCategory;
  label: string;
}

export interface FinanceCategoryStatistic {
  category: FinanceCategory;
  amount: number;
  percentage: number;
}

export interface FinanceCategoryStatistics {
  month: string;
  totalExpenses: number;
  categories: FinanceCategoryStatistic[];
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

export interface SavingsGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  category: SavingsGoalCategory;
  status: SavingsGoalStatus;
  monthlySavingRate?: number | null;
  notes?: string | null;
}

export interface SavingsGoal extends SavingsGoalRequest {
  id: number;
  remainingAmount: number;
  progressPercentage: number;
  monthlySavingRate: number;
  estimatedMonthsToCompletion?: number | null;
  estimatedCompletionDate?: string | null;
  createdAt: string;
}

export interface SavingsGoalSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  pausedGoals: number;
  cancelledGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemainingAmount: number;
  overallProgressPercentage: number;
  monthlySavingRate: number;
  estimatedMonthsToCompletion?: number | null;
  estimatedCompletionDate?: string | null;
  nearestGoalToComplete?: SavingsGoal | null;
}
