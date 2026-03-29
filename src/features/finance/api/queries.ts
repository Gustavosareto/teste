import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BankAccount, 
  ExpenseCategory, 
  FinancialGoal, 
  MonthlyCashFlowPoint, 
  RecurringBill,
  Transaction
} from "../types";

import {
  bankAccounts,
  expenseByCategory,
  financialGoals,
  monthlyCashFlow,
  recurringBills,
} from "../data/financeMockData";

async function fetchMock<T>(data: T, shouldFail = false): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Falha simulada na API"));
      } else {
        resolve(data);
      }
    }, 600);
  });
}

export const getAccounts = () => fetchMock<BankAccount[]>(bankAccounts);
export const getGoals = () => fetchMock<FinancialGoal[]>(financialGoals);
export const getBills = () => fetchMock<RecurringBill[]>(recurringBills);
export const getCashFlow = () => fetchMock<MonthlyCashFlowPoint[]>(monthlyCashFlow);
export const getExpenses = () => fetchMock<ExpenseCategory[]>(expenseByCategory);

export const createGoal = async (newGoal: Omit<FinancialGoal, "id" | "status">) => {
  return new Promise<FinancialGoal>((resolve) => {
    setTimeout(() => {
      const goal: FinancialGoal = {
        ...newGoal,
        id: `goal-${Math.random().toString(36).substr(2, 9)}`,
        status: newGoal.currentAmount >= newGoal.targetAmount ? "concluida" : "em-dia",
      };
      financialGoals.push(goal);
      resolve(goal);
    }, 800);
  });
};

export const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
  return new Promise<FinancialGoal>((resolve, reject) => {
    setTimeout(() => {
      const index = financialGoals.findIndex(g => g.id === id);
      if (index === -1) return reject(new Error("Goal not found"));
      
      financialGoals[index] = { 
        ...financialGoals[index], 
        ...updates,
        status: (updates.currentAmount ?? financialGoals[index].currentAmount) >= (updates.targetAmount ?? financialGoals[index].targetAmount) 
          ? "concluida" 
          : "em-dia"
      };
      resolve(financialGoals[index]);
    }, 800);
  });
};

export const deleteGoal = async (id: string) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const index = financialGoals.findIndex(g => g.id === id);
      if (index !== -1) financialGoals.splice(index, 1);
      resolve();
    }, 600);
  });
};

export const createAccount = async (newAccount: Omit<BankAccount, "id" | "lastUpdate">) => {
  return new Promise<BankAccount>((resolve) => {
    setTimeout(() => {
      const account: BankAccount = {
        ...newAccount,
        id: `acc-${Math.random().toString(36).substr(2, 9)}`,
        lastUpdate: new Date().toISOString()
      };
      bankAccounts.push(account);
      resolve(account);
    }, 800);
  });
};

export const updateAccount = async (id: string, updates: Partial<BankAccount>) => {
  return new Promise<BankAccount>((resolve, reject) => {
    setTimeout(() => {
      const index = bankAccounts.findIndex(a => a.id === id);
      if (index === -1) return reject(new Error("Account not found"));
      
      bankAccounts[index] = { 
        ...bankAccounts[index], 
        ...updates,
        lastUpdate: new Date().toISOString()
      };
      resolve(bankAccounts[index]);
    }, 800);
  });
};

export const deleteAccount = async (id: string) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const index = bankAccounts.findIndex(a => a.id === id);
      if (index !== -1) bankAccounts.splice(index, 1);
      resolve();
    }, 600);
  });
};

export const createBill = async (newBill: Omit<RecurringBill, "id">) => {
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

export const updateBill = async (id: string, updates: Partial<RecurringBill>) => {
  return new Promise<RecurringBill>((resolve, reject) => {
    setTimeout(() => {
      const index = recurringBills.findIndex(b => b.id === id);
      if (index === -1) return reject(new Error("Bill not found"));
      
      recurringBills[index] = { 
        ...recurringBills[index], 
        ...updates,
      };
      resolve(recurringBills[index]);
    }, 800);
  });
};

export const deleteBill = async (id: string) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const index = recurringBills.findIndex(b => b.id === id);
      if (index !== -1) recurringBills.splice(index, 1);
      resolve();
    }, 600);
  });
};

export function useAccounts() {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: getAccounts,
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ["financial-goals"],
    queryFn: getGoals,
  });
}

export function useBills() {
  return useQuery({
    queryKey: ["recurring-bills"],
    queryFn: getBills,
  });
}

export function useCashFlow() {
  return useQuery({
    queryKey: ["cash-flow"],
    queryFn: getCashFlow,
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses-category"],
    queryFn: getExpenses,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
    }
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<FinancialGoal> }) => updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
    }
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
    }
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    }
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<BankAccount> }) => updateAccount(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    }
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    }
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-bills"] });
    }
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<RecurringBill> }) => updateBill(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-bills"] });
    }
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-bills"] });
    }
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, "id" | "date">) => {
      await new Promise(r => setTimeout(r, 800));
      const transaction: Transaction = {
        ...newTransaction,
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString(),
      };
      
      const account = bankAccounts.find(a => a.id === newTransaction.accountId);
      if (account) {
        if (newTransaction.type === "income") {
          account.currentBalance += newTransaction.amount;
        } else {
          account.currentBalance -= newTransaction.amount;
        }
        account.lastUpdate = new Date().toISOString();
      }
      
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["cash-flow"] });
    },
  });
}