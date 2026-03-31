import { FormEvent, useState } from 'react';
import { useCreateBill, useUpdateBill } from '../../finance/api/queries';
import { RecurringBill, BillType, BillStatus } from '../../finance/types';
import { CurrencyInput } from '../../../components/ui/CurrencyInput';

interface BillFormProps {
  initialData?: RecurringBill;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BillForm({ initialData, onSuccess, onCancel }: BillFormProps) {
  const isEditing = !!initialData;
  const { mutate: createBill, isPending: isCreating } = useCreateBill();
  const { mutate: updateBill, isPending: isUpdating } = useUpdateBill();
  
  const isPending = isCreating || isUpdating;
  const [error, setError] = useState('');

  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<BillType>(initialData?.type || 'boleto');
  const [amount, setAmount] = useState<number | undefined>(initialData?.amount || 0);
  const [dueDay, setDueDay] = useState<number>(initialData?.dueDay || 1);
  const [status, setStatus] = useState<BillStatus>(initialData?.status || 'pendente');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name || amount === undefined || !dueDay) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (dueDay < 1 || dueDay > 31) {
      setError('O dia de vencimento deve estar entre 1 e 31.');
      return;
    }

    const payload = {
      name,
      type,
      amount,
      dueDay,
      status,
    };

    const handleSuccess = () => onSuccess();
    const handleError = () => setError('Ocorreu um erro. Tente novamente.');

    if (isEditing && initialData) {
      updateBill(
        { id: initialData.id, updates: payload },
        { onSuccess: handleSuccess, onError: handleError }
      );
    } else {
      createBill(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-900 dark:text-slate-100">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Descrição da Despesa *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: Aluguel, Netflix, Luz"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 sm:text-sm bg-white dark:bg-slate-900"
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as BillType)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 sm:text-sm bg-white dark:bg-slate-900"
            disabled={isPending}
          >
            <option value="boleto">Boleto</option>
            <option value="assinatura">Assinatura</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BillStatus)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 sm:text-sm bg-white dark:bg-slate-900"
            disabled={isPending}
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Valor *
          </label>
          <CurrencyInput
            id="amount"
            name="amount"
            required
            value={amount}
            onChange={setAmount}
            disabled={isPending}
            className="bg-white dark:bg-slate-900"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dueDay" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Dia do Vencimento (1-31) *
          </label>
          <input
            type="number"
            id="dueDay"
            name="dueDay"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(Number(e.target.value))}
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 sm:text-sm bg-white dark:bg-slate-900"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="pt-4 flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
          disabled={isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isPending ? 'Salvando...' : isEditing ? 'Atualizar Despesa' : 'Salvar Despesa'}
        </button>
      </div>
    </form>
  );
}
