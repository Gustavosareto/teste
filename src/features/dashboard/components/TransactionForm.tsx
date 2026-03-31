import { useState, useEffect } from "react";
import { useAccounts, useCreateTransaction } from "../../finance/api/queries";
import { CurrencyInput } from "../../../components/ui/CurrencyInput";
import { TransactionType, TransactionCategory } from "../../finance/types";

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORY_KEYWORDS: Record<string, TransactionCategory> = {
  'ifood': 'Alimentação',
  'uber': 'Transporte',
  '99pop': 'Transporte',
  'amazon': 'Compras',
  'mercado livre': 'Compras',
  'netflix': 'Assinaturas',
  'spotify': 'Assinaturas',
  'aluguel': 'Moradia',
  'condominio': 'Moradia',
  'luz': 'Moradia',
  'agua': 'Moradia',
  'restaurante': 'Alimentação',
  'mercado': 'Alimentação',
  'supermercado': 'Alimentação',
  'combustivel': 'Transporte',
  'posto': 'Transporte',
  'farmacia': 'Saúde' as any, // Adicionando dinamicamente se necessário
  'salario': 'Salário',
  'investimento': 'Investimento',
  'dividendos': 'Investimento',
};

const CATEGORIES: TransactionCategory[] = [
  'Alimentação', 'Compras', 'Transporte', 'Lazer', 'Assinaturas', 'Moradia', 'Salário', 'Investimento', 'Outros'
];

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const { data: accounts } = useAccounts();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Outros");
  const [amount, setAmount] = useState(0);
  const [accountId, setAccountId] = useState("");
  const [installments, setInstallments] = useState<number>(1);
  const [isAutoSuggesting, setIsAutoSuggesting] = useState(false);

  // IA Simples de sugestão de categoria
  useEffect(() => {
    const lowerDesc = description.toLowerCase().trim();
    if (!lowerDesc) return;

    // Detectar parcelas na descrição se digitado manualmente (Ex: "Compra 1/3")
    const match = lowerDesc.match(/\s+(\d{1,2})\/(\d{1,2})\s*$/);
    if (match) {
      setInstallments(parseInt(match[2]));
    }

    for (const [key, cat] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lowerDesc.includes(key)) {
        setCategory(cat);
        setIsAutoSuggesting(true);
        const timer = setTimeout(() => setIsAutoSuggesting(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0 || !accountId) return;

    if (type === "expense" && installments > 1) {
      const installmentAmount = amount / installments;
      const baseDescription = description.replace(/\s+\d{1,2}\/\d{1,2}\s*$/, "").trim();
      
      for (let i = 1; i <= installments; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + (i - 1));
        
        await createTransaction({
          type,
          description: `${baseDescription} ${i}/${installments}`,
          amount: Number(installmentAmount.toFixed(2)),
          accountId,
          category,
          date: date.toISOString()
        });
      }
      onSuccess?.();
    } else {
      createTransaction(
        { type, description, amount, accountId, category, date: new Date().toISOString() },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2 text-slate-900 dark:text-slate-100">
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => { setType("expense"); setCategory("Outros"); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === "expense" 
              ? "bg-white dark:bg-slate-900 text-red-600 shadow-md dark:shadow-black/20" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-300"
          }`}
        >
          Gastos (Despesa)
        </button>
        <button
          type="button"
          onClick={() => { setType("income"); setCategory("Salário"); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === "income" 
              ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-md dark:shadow-black/20" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-300"
          }`}
        >
          Dinheiro (Receita)
        </button>
      </div>

      <div className="space-y-1.5 relative">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Descrição (onde gastou ou de onde recebeu?)
        </label>
        <input
          id="description"
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: iFood, Uber, Salário..."
          className="block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-md dark:shadow-black/20 focus:border-slate-900 focus:ring-slate-900 dark:focus:ring-slate-100 sm:text-sm border p-2 bg-white dark:bg-slate-900"
        />
        {isAutoSuggesting && (
           <span className="absolute -bottom-5 left-0 text-[10px] text-emerald-600 font-bold animate-pulse">
             ✨ Categoria "{category}" sugerida automaticamente
           </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-md dark:shadow-black/20 focus:border-slate-900 focus:ring-slate-900 dark:focus:ring-slate-100 sm:text-sm border p-2 bg-white dark:bg-slate-900"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Valor {type === 'expense' && installments > 1 ? `(Total)` : ''}
          </label>
          <CurrencyInput
            id="amount"
            value={amount}
            onChange={(val) => setAmount(val || 0)}
            className="text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {type === 'expense' && (
        <div className="space-y-1.5">
          <label htmlFor="installments" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Parcelas
          </label>
          <div className="flex items-center gap-3">
            <select
              id="installments"
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="block w-32 rounded-md border-slate-300 dark:border-slate-700 shadow-md focus:border-slate-900 focus:ring-slate-900 sm:text-sm border p-2 bg-white dark:bg-slate-900"
            >
              {[1, 2, 3, 4, 5, 6, 12, 18, 24, 36, 48].map(n => (
                <option key={n} value={n}>{n === 1 ? 'À vista' : `${n}x`}</option>
              ))}
            </select>
            {installments > 1 && amount > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                Sendo {installments}x de R$ {(amount / installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="accountId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Conta relacionada
        </label>
        <select
          id="accountId"
          required
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-md dark:shadow-black/20 focus:border-slate-900 focus:ring-slate-900 dark:focus:ring-slate-100 sm:text-sm border p-2 bg-white dark:bg-slate-900"
        >
          <option value="">Selecione a conta...</option>
          {accounts?.map((account) => (
            <option key={account.id} value={account.id}>
              {account.institution} - {account.name} (R$ {account.currentBalance.toLocaleString("pt-BR")})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 rounded-md transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending || !accountId || amount <= 0 || !description}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-md dark:shadow-black/20 transition-colors ${
            type === "expense" 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-emerald-600 hover:bg-emerald-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? "Salvando..." : "Salvar Transação"}
        </button>
      </div>
    </form>
  );
}