import {
  BankAccount,
  ExpenseCategory,
  FinancialGoal,
  MonthlyCashFlowPoint,
  RecurringBill,
} from '../types';

export const monthlyCashFlow: MonthlyCashFlowPoint[] = [
  { month: 'Jan', income: 12800, expense: 7900 },
  { month: 'Fev', income: 15400, expense: 9300 },
  { month: 'Mar', income: 14200, expense: 11000 },
  { month: 'Abr', income: 18500, expense: 10200 },
  { month: 'Mai', income: 16800, expense: 12500 },
  { month: 'Jun', income: 21900, expense: 9800 },
];

export const expenseByCategory: ExpenseCategory[] = [
  { category: 'Moradia', amount: 4200, color: '#1d4ed8' },
  { category: 'Alimentacao', amount: 1850, color: '#0891b2' },
  { category: 'Transporte', amount: 960, color: '#7c3aed' },
  { category: 'Saude', amount: 720, color: '#dc2626' },
  { category: 'Lazer', amount: 610, color: '#ea580c' },
];

export const bankAccounts: BankAccount[] = [
  {
    id: 'acc-001',
    name: 'Conta Principal',
    institution: 'Banco Inter',
    type: 'corrente',
    currentBalance: 8450.9,
    lastUpdate: '2026-03-28',
  },
  {
    id: 'acc-002',
    name: 'Reserva de Emergencia',
    institution: 'Nubank',
    type: 'poupanca',
    currentBalance: 15230.44,
    lastUpdate: '2026-03-28',
  },
  {
    id: 'acc-003',
    name: 'Carteira de ETFs',
    institution: 'XP Investimentos',
    type: 'investimento',
    currentBalance: 21480.11,
    lastUpdate: '2026-03-27',
  },
];

export const financialGoals: FinancialGoal[] = [
  {
    id: 'goal-001',
    title: 'Viagem de ferias',
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: '2026-12-20',
    status: 'em-dia',
  },
  {
    id: 'goal-002',
    title: 'Entrada apartamento',
    targetAmount: 90000,
    currentAmount: 24200,
    deadline: '2028-08-01',
    status: 'em-dia',
  },
  {
    id: 'goal-003',
    title: 'Troca de notebook',
    targetAmount: 8000,
    currentAmount: 7900,
    deadline: '2026-04-15',
    status: 'atrasada',
  },
];

export const recurringBills: RecurringBill[] = [
  {
    id: 'bill-001',
    name: 'Condominio',
    type: 'boleto',
    amount: 780,
    dueDay: 5,
    status: 'pago',
  },
  {
    id: 'bill-002',
    name: 'Energia eletrica',
    type: 'boleto',
    amount: 268.75,
    dueDay: 10,
    status: 'pendente',
  },
  {
    id: 'bill-003',
    name: 'Spotify Premium',
    type: 'assinatura',
    amount: 27.9,
    dueDay: 12,
    status: 'pendente',
  },
  {
    id: 'bill-004',
    name: 'Internet Fibra',
    type: 'boleto',
    amount: 119.9,
    dueDay: 18,
    status: 'pendente',
  },
];
