import {
  ExpenseCategory,
  FinancialGoal,
  MonthlyCashFlowPoint,
  RecurringBill,
} from './types';

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export function getFinancialSummary(
  cashFlow: MonthlyCashFlowPoint[]
): FinancialSummary {
  const totalIncome = cashFlow.reduce((sum, point) => sum + point.income, 0);
  const totalExpense = cashFlow.reduce((sum, point) => sum + point.expense, 0);

  return {
    totalIncome,
    totalExpense,
    currentBalance: totalIncome - totalExpense,
  };
}

export function getExpenseCategoryPercentages(categories: ExpenseCategory[]) {
  const total = categories.reduce((sum, category) => sum + category.amount, 0);

  return categories.map((category) => ({
    ...category,
    percentage: total === 0 ? 0 : (category.amount / total) * 100,
  }));
}

export function getGoalsProgress(goals: FinancialGoal[]) {
  return goals.map((goal) => ({
    ...goal,
    progress: goal.targetAmount === 0 ? 0 : (goal.currentAmount / goal.targetAmount) * 100,
    remainingAmount: Math.max(goal.targetAmount - goal.currentAmount, 0),
  }));
}

export function getPendingBillsAmount(bills: RecurringBill[]) {
  return bills
    .filter((bill) => bill.status === 'pendente')
    .reduce((sum, bill) => sum + bill.amount, 0);
}
