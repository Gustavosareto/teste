import { useState } from "react";
import { useAccounts, useCreateTransaction } from "../../finance/api/queries";
import { CurrencyInput } from "../../../components/ui/CurrencyInput";
import { TransactionType } from "../../finance/types";

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const { data: accounts } = useAccounts();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [accountId, setAccountId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0 || !accountId) return;

    createTransaction(
      { type, description, amount, accountId },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2 text-slate-900">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === "expense" 
              ? "bg-white text-red-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Gastos (Despesa)
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === "income" 
              ? "bg-white text-emerald-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Dinheiro (Receita)
        </button>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Descrição (onde gastou ou de onde recebeu?)
        </label>
        <input
          id="description"
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Aluguel, Supermercado, Salário..."
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm border p-2 bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
          Valor
        </label>
        <CurrencyInput
          id="amount"
          value={amount}
          onChange={(val) => setAmount(val || 0)}
          className="text-slate-900"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="accountId" className="block text-sm font-medium text-slate-700">
          Conta relacionada
        </label>
        <select
          id="accountId"
          required
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm border p-2 bg-white"
        >
          <option value="">Selecione a conta...</option>
          {accounts?.map((account) => (
            <option key={account.id} value={account.id}>
              {account.institution} - {account.name} (R$ {account.currentBalance.toLocaleString("pt-BR")})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending || !accountId || amount <= 0 || !description}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors ${
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