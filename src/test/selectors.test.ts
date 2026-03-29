import { describe, it, expect } from 'vitest';
import { 
  getFinancialSummary, 
  getExpenseCategoryPercentages, 
  getGoalsProgress,
  getPendingBillsAmount
} from '../features/finance/selectors';

describe('Selectors', () => {
  it('getFinancialSummary must calculate correct balances', () => {
    const mockCashFlow = [
      { month: 'Jan', income: 100, expense: 50 },
      { month: 'Fev', income: 200, expense: 100 },
    ];
    
    const result = getFinancialSummary(mockCashFlow);
    expect(result.totalIncome).toBe(300);
    expect(result.totalExpense).toBe(150);
    expect(result.currentBalance).toBe(150);
  });

  it('getExpenseCategoryPercentages must calculate exact percentages', () => {
    const mockCategories = [
      { category: 'A', amount: 50, color: 'red' },
      { category: 'B', amount: 50, color: 'blue' },
    ];
    
    const result = getExpenseCategoryPercentages(mockCategories);
    expect(result[0].percentage).toBe(50);
    expect(result[1].percentage).toBe(50);
  });

  it('getGoalsProgress must cap correctly and show remaining amount', () => {
    const mockGoals: any = [
      { id: '1', targetAmount: 1000, currentAmount: 500 },
      { id: '2', targetAmount: 1000, currentAmount: 1200 }, // Over achieved
    ];

    const result = getGoalsProgress(mockGoals);
    expect(result[0].progress).toBe(50);
    expect(result[0].remainingAmount).toBe(500);

    // Current logic does not cap progress internally at 100, but cap UI. But remaining should be 0.
    expect(result[1].progress).toBe(120);
    expect(result[1].remainingAmount).toBe(0); 
  });

  it('getPendingBillsAmount must filter only pending items', () => {
    const mockBills: any = [
      { id: '1', amount: 100, status: 'pendente' },
      { id: '2', amount: 200, status: 'pago' },
    ];

    const result = getPendingBillsAmount(mockBills);
    expect(result).toBe(100);
  });
});