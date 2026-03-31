import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MonthlyCashFlowPoint, ExpenseCategory } from '../types';
import { supabase } from "../../../lib/supabase";
import { 
  BankAccount, 
  FinancialGoal, 
  RecurringBill,
  Transaction,
  Asset
} from "../types";

// --- Queries (Leitura) ---

const getTopCryptos = async () => {
  try {
    const apiKey = import.meta.env.VITE_BRAPI_KEY;
    const response = await fetch(`https://brapi.dev/api/v2/crypto?sortBy=market_cap_desc&limit=10&token=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      return data.coins || [];
    }
  } catch (err) {
    console.error('Erro ao buscar top criptos:', err);
  }
  return [];
};

export function useTopCryptos() {
  return useQuery({
    queryKey: ["top-cryptos"],
    queryFn: getTopCryptos,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

const getAssets = async () => {
  const { data: supabaseAssets, error } = await supabase
    .from('assets')
    .select('*')
    .order('symbol');
  if (error) throw error;

  const assets = supabaseAssets as Asset[];
  
  // Se não houver ativos, retornamos vazio
  if (assets.length === 0) return [];

  // Buscar preços reais da Brapi
  try {
    const apiKey = import.meta.env.VITE_BRAPI_KEY;
    
    // Separar criptos de ativos normais (Bovespa)
    // Geralmente criptos não terminam com número e são tratadas no endpoint v2/crypto
    const cryptoSymbols = assets.filter(a => a.type === 'Criptomoeda').map(a => a.symbol);
    const regularSymbols = assets.filter(a => a.type !== 'Criptomoeda').map(a => a.symbol);

    let updatedAssets = [...assets];

    // Buscar Criptomoedas PRIMEIRO (Brapi usa o endpoint /api/v2/crypto)
    // Isso evita que o BTC seja confundido com o ETF da Grayscale da bolsa
    if (cryptoSymbols.length > 0) {
      const response = await fetch(`https://brapi.dev/api/v2/crypto?coin=${cryptoSymbols.join(',')}&currency=BRL&token=${apiKey}`);
      if (response.ok) {
        const cryptoData = await response.json();
        updatedAssets = updatedAssets.map(asset => {
          const quote = cryptoData.coins.find((c: any) => c.coin === asset.symbol);
          if (quote) {
            // Usando especificamente o regularMarketPrice retornado pela Brapi Crypto
            return {
              ...asset,
              currentPrice: quote.regularMarketPrice || quote.coinPrice || asset.currentPrice,
              name: quote.coinName || asset.name,
              updatedAt: new Date().toISOString()
            };
          }
          return asset;
        });
      }
    }

    // Buscar ativos normais (Apenas se não forem criptos já atualizadas)
    if (regularSymbols.length > 0) {
      const response = await fetch(`https://brapi.dev/api/quote/${regularSymbols.join(',')}?token=${apiKey}`);
      if (response.ok) {
        const brapiData = await response.json();
        updatedAssets = updatedAssets.map(asset => {
          // Se já foi atualizado como cripto, pula
          if (asset.type === 'Criptomoeda' && asset.updatedAt) return asset;

          const quote = brapiData.results.find((r: any) => r.symbol === asset.symbol);
          if (quote) {
            return {
              ...asset,
              currentPrice: quote.regularMarketPrice || asset.currentPrice,
              name: quote.longName || asset.name,
              updatedAt: new Date().toISOString()
            };
          }
          return asset;
        });
      }
    }

    return updatedAssets;
  } catch (err) {
    console.warn('Falha ao buscar cotações da Brapi, usando dados locais:', err);
  }

  return assets;
};

const getAccounts = async () => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as BankAccount[];
};

const getGoals = async () => {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .order('deadline');
  if (error) throw error;
  return data as FinancialGoal[];
};

const getBills = async () => {
  const { data, error } = await supabase
    .from('recurring_bills')
    .select('*')
    .order('dueDay');
  if (error) throw error;
  return data as RecurringBill[];
};

const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Transaction[];
};


// --- Mutations ---

const createGoal = async (newGoal: Omit<FinancialGoal, "id" | "status">) => {
  const { data, error } = await supabase
    .from('financial_goals')
    .insert([{ ...newGoal, status: 'em-dia' }])
    .select()
    .single();
  if (error) throw error;
  return data as FinancialGoal;
};

const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
  const { data, error } = await supabase
    .from('financial_goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as FinancialGoal;
};

const deleteGoal = async (id: string) => {
  const { error } = await supabase.from('financial_goals').delete().eq('id', id);
  if (error) throw error;
};

const createAccount = async (newAccount: Omit<BankAccount, "id" | "lastUpdate">) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert([{ ...newAccount, color: '#3b82f6' }])
    .select()
    .single();
  if (error) throw error;
  return data as BankAccount;
};

const updateAccount = async (id: string, updates: Partial<BankAccount>) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .update({ ...updates, lastUpdate: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BankAccount;
};

const deleteAccount = async (id: string) => {
  const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
  if (error) throw error;
};

const createBill = async (newBill: Omit<RecurringBill, "id">) => {
  const { data, error } = await supabase
    .from('recurring_bills')
    .insert([newBill])
    .select()
    .single();
  if (error) throw error;
  return data as RecurringBill;
};

const updateBill = async (id: string, updates: Partial<RecurringBill>) => {
  const { data, error } = await supabase
    .from('recurring_bills')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as RecurringBill;
};

const deleteBill = async (id: string) => {
  const { error } = await supabase.from('recurring_bills').delete().eq('id', id);
  if (error) throw error;
};

const createTransaction = async (newTransaction: Omit<Transaction, "id">) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...newTransaction, date: newTransaction.date || new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;

  // Update bank account.currentBalance
  const { data: account } = await supabase.from('bank_accounts').select('currentBalance').eq('id', newTransaction.accountId).single();
  if (account) {
    const newBalance = newTransaction.type === 'income' 
      ? Number(account.currentBalance) + Number(newTransaction.amount)
      : Number(account.currentBalance) - Number(newTransaction.amount);
    await supabase.from('bank_accounts').update({ currentBalance: newBalance, lastUpdate: new Date().toISOString() }).eq('id', newTransaction.accountId);
  }

  return data as Transaction;
};

const createTransactionsBulk = async (transactions: Omit<Transaction, "id">[]) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions.map(t => ({
      ...t,
      date: t.date || new Date().toISOString()
    })));
  if (error) throw error;
  
  // Bulks usually need updating balances per account
  const accountGroups: Record<string, number> = {};
  transactions.forEach(t => {
    if (!accountGroups[t.accountId]) accountGroups[t.accountId] = 0;
    accountGroups[t.accountId] += t.type === 'income' ? Number(t.amount) : -Number(t.amount);
  });
  
  for (const [accountId, diff] of Object.entries(accountGroups)) {
    const { data: acc } = await supabase.from('bank_accounts').select('currentBalance').eq('id', accountId).single();
    if (acc) {
      await supabase.from('bank_accounts').update({ currentBalance: Number(acc.currentBalance) + diff, lastUpdate: new Date().toISOString() }).eq('id', accountId);
    }
  }

  return data;
};

const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  // Pega a transação antiga primeiro para calcular a diferença
  const { data: oldTx } = await supabase.from('transactions').select('*').eq('id', id).single();
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  // Atualiza saldo caso o valor tenha mudado
  if (oldTx && updates.amount && oldTx.amount !== updates.amount) {
    const { data: account } = await supabase.from('bank_accounts').select('currentBalance').eq('id', oldTx.accountId).single();
    if (account) {
      // Reverte o valor antigo e aplica o novo
      let newBalance = Number(account.currentBalance);
      newBalance += oldTx.type === 'income' ? -Number(oldTx.amount) : Number(oldTx.amount);
      newBalance += oldTx.type === 'income' ? Number(updates.amount) : -Number(updates.amount);
      await supabase.from('bank_accounts').update({ currentBalance: newBalance, lastUpdate: new Date().toISOString() }).eq('id', oldTx.accountId);
    }
  }

  return data as Transaction;
};

const deleteTransaction = async (id: string) => {
  const { data: oldTx } = await supabase.from('transactions').select('*').eq('id', id).single();

  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;

  // Atualiza saldo revertendo a transação apagada
  if (oldTx) {
    const { data: account } = await supabase.from('bank_accounts').select('currentBalance').eq('id', oldTx.accountId).single();
    if (account) {
      const newBalance = oldTx.type === 'income' 
        ? Number(account.currentBalance) - Number(oldTx.amount)
        : Number(account.currentBalance) + Number(oldTx.amount);
      await supabase.from('bank_accounts').update({ currentBalance: newBalance, lastUpdate: new Date().toISOString() }).eq('id', oldTx.accountId);
    }
  }
};

// --- Hooks ---

export function useAccounts() {
  return useQuery({ queryKey: ["bank-accounts"], queryFn: getAccounts });
}
export function useGoals() {
  return useQuery({ queryKey: ["financial-goals"], queryFn: getGoals });
}
export function useBills() {
  return useQuery({ queryKey: ["recurring-bills"], queryFn: getBills });
}
export function useTransactions() {
  return useQuery({ queryKey: ["transactions"], queryFn: getTransactions });
}
export function useAssets() {
  return useQuery({ queryKey: ["assets"], queryFn: getAssets });
}
export function useCashFlow(period: '7-dias' | '30-di' | 'este-mes' | 'mes-passado' | 'este-ano' = 'este-mes') {
  return useQuery({ 
    queryKey: ["cash-flow", period], 
    queryFn: async (): Promise<MonthlyCashFlowPoint[]> => {
      const { data, error } = await supabase.from('transactions').select('*');
      if (error) throw error;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const filteredData = data.filter(t => {
        const d = new Date(t.date);
        if (period === '7-dias') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return d >= sevenDaysAgo && d <= now;
        }
        if (period === '30-di') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return d >= thirtyDaysAgo && d <= now;
        }
        if (period === 'este-mes') {
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        if (period === 'mes-passado') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        }
        if (period === 'este-ano') {
          return d.getFullYear() === currentYear;
        }
        return true;
      });

      const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      
      if (period === '7-dias' || period === '30-di') {
        const map: Record<string, {income: number, expense: number}> = {};
        const days = period === '7-dias' ? 7 : 30;
        
        // Inicializar dias para garantir que a linha apareça mesmo sem dados
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`;
          map[dayLabel] = { income: 0, expense: 0 };
        }

        filteredData.forEach((t) => {
          const date = new Date(t.date);
          const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`;
          if (map[dayLabel]) {
            if(t.type === 'income') map[dayLabel].income += Number(t.amount);
            if(t.type === 'expense') map[dayLabel].expense += Number(t.amount);
          }
        });

        return Object.keys(map).map(day => ({
          month: day, // usamos a chave month para compatibilidade com o gráfico
          income: map[day].income,
          expense: map[day].expense
        }));
      }

      const map: Record<string, {income: number, expense: number}> = {};
      
      // Inicializar todos os meses se for "este-ano" para garantir que as linhas apareçam
      if (period === 'este-ano') {
        months.forEach(m => map[m] = { income: 0, expense: 0 });
      }

      filteredData.forEach((t) => {
        const date = new Date(t.date);
        const monthName = months[date.getMonth()];
        if(!map[monthName]) map[monthName] = { income: 0, expense: 0 };
        if(t.type === 'income') map[monthName].income += Number(t.amount);
        if(t.type === 'expense') map[monthName].expense += Number(t.amount);
      });
      
      const result = months
        .filter(m => map[m])
        .map(m => ({ month: m, income: map[m].income, expense: map[m].expense }));

      return result;
    }
  });
}

export function useExpenses(period: '7-dias' | '30-di' | 'este-mes' | 'mes-passado' | 'este-ano' = 'este-mes') {
  return useQuery({ 
    queryKey: ["expenses-category", period], 
    queryFn: async (): Promise<ExpenseCategory[]> => {
      const { data, error } = await supabase.from('transactions').select('*').eq('type', 'expense');
      if (error) throw error;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const filteredData = data.filter(t => {
        const d = new Date(t.date);
        if (period === '7-dias') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return d >= sevenDaysAgo && d <= now;
        }
        if (period === '30-di') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return d >= thirtyDaysAgo && d <= now;
        }
        if (period === 'este-mes') {
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        if (period === 'mes-passado') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        }
        if (period === 'este-ano') {
          return d.getFullYear() === currentYear;
        }
        return true;
      });
      
      const map: Record<string, number> = {};
      filteredData.forEach((t) => {
        if(!map[t.category]) map[t.category] = 0;
        map[t.category] += Number(t.amount);
      });
      
      const colors = ['#1d4ed8','#0891b2','#7c3aed','#dc2626','#ea580c','#10b981','#f59e0b', '#ec4899', '#8b5cf6'];
      let i = 0;
      
      return Object.keys(map).map(cat => ({
        category: cat,
        amount: map[cat],
        color: colors[(i++) % colors.length]
      }));
    }
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
  });
}
export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<FinancialGoal> }) => updateGoal(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
  });
}
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-goals"] })
  });
}

export function useCreateTransactionsBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransactionsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-flow"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-category"] });
    }
  });
}
export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-accounts"] })
  });
}
export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<BankAccount> }) => updateAccount(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-accounts"] })
  });
}
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-accounts"] })
  });
}
export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-bills"] })
  });
}
export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<RecurringBill> }) => updateBill(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-bills"] })
  });
}
export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-bills"] })
  });
}
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); queryClient.invalidateQueries({ queryKey: ["cash-flow"] }); queryClient.invalidateQueries({ queryKey: ["expenses-category"] }); queryClient.invalidateQueries({ queryKey: ["bank-accounts"] }); }
  });
}
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Transaction> }) => updateTransaction(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); queryClient.invalidateQueries({ queryKey: ["cash-flow"] }); queryClient.invalidateQueries({ queryKey: ["expenses-category"] }); queryClient.invalidateQueries({ queryKey: ["bank-accounts"] }); }
  });
}
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); queryClient.invalidateQueries({ queryKey: ["cash-flow"] }); queryClient.invalidateQueries({ queryKey: ["expenses-category"] }); queryClient.invalidateQueries({ queryKey: ["bank-accounts"] }); }
  });
}

const createAsset = async (newAsset: Omit<Asset, "id" | "updatedAt">) => {
  const { data, error } = await supabase
    .from('assets')
    .insert([newAsset])
    .select()
    .single();
  if (error) throw error;
  return data as Asset;
};

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] })
  });
}

const syncB3Assets = async () => {
  // 1. Pega os ativos do banco
  const { data: assets, error: fetchError } = await supabase.from('assets').select('*');
  if (fetchError) throw fetchError;
  
  // 2. Filtra so o que for brasileiro (Ações/FIIs)
  // Nota: A Brapi não tem um filtro explicito "brazilian only" no endpoint de quote,
  // mas como estamos filtrando os ativos do BANCO que são Ações/FIIs, eles já são B3.
  const b3Assets = (assets as Asset[]).filter(a => a.type === 'Ações' || a.type === 'FIIs');
  if (b3Assets.length === 0) return { updated: 0 };

  const tickers = b3Assets.map(a => a.symbol).join(',');
  
  try {
    // 3. Busca cotacao atual na brapi.dev
    const apiKey = import.meta.env.VITE_BRAPI_KEY;
    const res = await fetch(`https://brapi.dev/api/quote/${tickers}?token=${apiKey}`);
    const data = await res.json();
    
    if (data.results) {
      let updatedCount = 0;
      for (const result of data.results) {
        if (result.regularMarketPrice) {
          // Atualiza o preco no supabase para todos os ativos com esse ticker
          const { error: updateError } = await supabase
            .from('assets')
            .update({ 
               currentPrice: result.regularMarketPrice, 
               name: result.longName || result.shortName,
               updatedAt: new Date().toISOString() 
            })
            .eq('symbol', result.symbol);
            
          if (!updateError) updatedCount++;
        }
      }
      return { updated: updatedCount };
    }
    return { updated: 0 };
  } catch (err) {
    console.error("Erro ao sincronizar com B3", err);
    throw err;
  }
};

export function useSyncB3Assets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncB3Assets,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] })
  });
}

const updateAsset = async (id: string, updates: Partial<Asset>) => {
  const { data, error } = await supabase
    .from('assets')
    .update({ ...updates, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Asset;
};

const deleteAsset = async (id: string) => {
  const { error } = await supabase.from('assets').delete().eq('id', id);
  if (error) throw error;
};

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Asset> }) => updateAsset(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] })
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] })
  });
}
