export type AccountType = 'corrente' | 'poupanca' | 'investimento';

export interface MonthlyCashFlowPoint {
  month: string;
  income: number;
  expense: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  color: string;
  budgetLimit?: number; // Teto de gastos opcional
}

export interface BankAccount {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  currentBalance: number;
  lastUpdate: string;
}

export type GoalStatus = 'em-dia' | 'atrasada' | 'concluida';

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: GoalStatus;
}

export type BillType = 'boleto' | 'assinatura';
export type BillStatus = 'pendente' | 'pago';

export interface RecurringBill {
  id: string;
  name: string;
  type: BillType;
  amount: number;
  dueDay: number;
  status: BillStatus;
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Alimentação' | 'Compras' | 'Transporte' | 'Lazer' | 'Assinaturas' | 'Moradia' | 'Outros' | 'Salário' | 'Investimento';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  accountId: string;
  category: TransactionCategory;
  date: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  color?: string;
  updatedAt: string;
}
