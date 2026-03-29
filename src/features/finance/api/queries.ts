import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BankAccount, 
  ExpenseCategory, 
  FinancialGoal, 
  MonthlyCashFlowPoint, 
  RecurringBill 
} from '../types';

// O client real estaria aqui `import { apiClient } from '../../../lib/api';`
// Para não quebrar por falta de mock de rotas complexas, usaremos os dados já criados como mock estático.
import {
  bankAccounts,
  expenseByCategory,
  financialGoals,
  monthlyCashFlow,
  recurringBills,
} from '../data/financeMockData';

/**
 * Simulador de chamadas de API tipadas que retorna uma Promise com delay
 */
async function fetchMock<T>(data: T, shouldFail = false): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Falha simulada na API'));
      } else {
        resolve(data);
      }
    }, 600);
  });
}

// ------------------------------
// API Calls
// ------------------------------
export const getAccounts = () => fetchMock<BankAccount[]>(bankAccounts);
export const getGoals = () => fetchMock<FinancialGoal[]>(financialGoals);
export const getBills = () => fetchMock<RecurringBill[]>(recurringBills);
export const getCashFlow = () => fetchMock<MonthlyCashFlowPoint[]>(monthlyCashFlow);
export const getExpenses = () => fetchMock<ExpenseCategory[]>(expenseByCategory);

export const createGoal = async (newGoal: Omit<FinancialGoal, 'id' | 'status'>) => {
  return new Promise<FinancialGoal>((resolve) => {
    setTimeout(() => {
      const goal: FinancialGoal = {
        ...newGoal,
        id: `goal-${Math.random().toString(36).substr(2, 9)}`,
        status: newGoal.currentAmount >= newGoal.targetAmount ? 'concluida' : 'em-dia',
      };
      // Mutating mock data directly to simulate backend state
      financialGoals.push(goal);
      resolve(goal);
    }, 800);
  });
};

// ------------------------------
// React Query Hooks
// ------------------------------

export const queryKeys = {
  accounts: ['accounts'] as const,
  goals: ['goals'] as const,
  bills: ['bills'] as const,
  cashFlow: ['cashFlow'] as const,
  expenses: ['expenses'] as const,
};

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: getAccounts,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: getGoals,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useBills() {
  return useQuery({
    queryKey: queryKeys.bills,
    queryFn: getBills,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCashFlow() {
  return useQuery({
    queryKey: queryKeys.cashFlow,
    queryFn: getCashFlow,
    staleTime: 1000 * 60 * 5,
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: getExpenses,
    staleTime: 1000 * 60 * 5,
  });
}

export const updateGoal = async (updatedGoal: FinancialGoal) => {
  return new Promise<FinancialGoal>((resolve) => {
    setTimeout(() => {
      const index = financialGoals.findIndex((g) => g.id === updatedGoal.id);
      if (index !== -1) {
        financialGoals[index] = {
          ...updatedGoal,
          status: updatedGoal.currentAmount >= updatedGoal.targetAmount ? 'concluida' : 'em-dia',
        };
      }
      resolve(updatedGoal);
    }, 800);
  });
};

export const deleteGoal = async (goalId: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      const index = financialGoals.findIndex((g) => g.id === goalId);
      if (index !== -1) {
        financialGoals.splice(index, 1);
      }
      resolve(goalId);
    }, 800);
  });
};

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export const createAccount = async (newAccount: Omit<BankAccount, 'id' | 'lastUpdate'>) => {
  return new Promise<BankAccount>((resolve) => {
    setTimeout(() => {
      const account: BankAccount = {
        ...newAccount,
        id: `acc-${Math.random().toString(36).substr(2, 9)}`,
        lastUpdate: new Date().toISOString(),
      };
      bankAccounts.push(account);
      resolve(account);
    }, 800);
  });
};

export const updateAccount = async (updatedAccount: BankAccount) => {
  return new Promise<BankAccount>((resolve) => {
    setTimeout(() => {
      const index = bankAccounts.findIndex((a) => a.id === updatedAccount.id);
      if (index !== -1) {
        bankAccounts[index] = {
          ...updatedAccount,
          lastUpdate: new Date().toISOString(),
        };
      }
      resolve(updatedAccount);
    }, 800);
  });
};

export const deleteAccount = async (id: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      const index = bankAccounts.findIndex((a) => a.id === id);
      if (index !== -1) bankAccounts.splice(index, 1);
      resolve(id);
    }, 800);
  });
};

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  });
}

export const createBill = async (newBill: Omit<RecurringBill, 'id'>) => {
  return new Promise<RecurringBill>((resolve) => {
    setTimeout(() => {
      const bill: RecurringBill = {
        ...newBill,
        id: `bill-${Math.random().toString(36).substr(2, 9)}`,
      };
      recurringBills.push(bill);
      resolve(bill);
    }, 800);
  });
};

export const updateBill = async (updatedBill: RecurringBill) => {
  return new Promise<RecurringBill>((resolve) => {
    setTimeout(() => {
      const index = recurringBills.findIndex((b) => b.id === updatedBill.id);
      if (index !== -1) {
        recurringBills[index] = updatedBill;
      }
      resolve(updatedBill);
    }, 800);
  });
};

export const deleteBill = async (id: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      const index = recurringBills.findIndex((b) => b.id === id);
      if (index !== -1) recurringBills.splice(index, 1);
      resolve(id);
    }, 800);
  });
};

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bills }),
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bills }),
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bills }),
  });
}
