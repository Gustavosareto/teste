import { FormEvent, useState } from 'react';
import { useCreateGoal, useUpdateGoal } from '../../finance/api/queries';
import { FinancialGoal } from '../../finance/types';
import { CurrencyInput } from '../../../components/ui/CurrencyInput';

interface GoalFormProps {
  initialData?: FinancialGoal;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GoalForm({ initialData, onSuccess, onCancel }: GoalFormProps) {
  const isEditing = !!initialData;
  const { mutate: createGoal, isPending: isCreating } = useCreateGoal();
  const { mutate: updateGoal, isPending: isUpdating } = useUpdateGoal();
  
  const isPending = isCreating || isUpdating;
  const [error, setError] = useState('');

  const [title, setTitle] = useState(initialData?.title || '');
  const [targetAmount, setTargetAmount] = useState<number | undefined>(initialData?.targetAmount);
  const [currentAmount, setCurrentAmount] = useState<number | undefined>(initialData?.currentAmount || 0);
  const [deadline, setDeadline] = useState(initialData?.deadline || '');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!title || targetAmount === undefined || !deadline) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (targetAmount <= 0) {
      setError('O valor da meta deve ser maior que zero.');
      return;
    }

    const payload = {
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
    };

    const handleSuccess = () => onSuccess();
    const handleError = () => setError('Ocorreu um erro. Tente novamente.');

    if (isEditing && initialData) {
      updateGoal(
        { id: initialData.id, updates: payload },
        { onSuccess: handleSuccess, onError: handleError }
      );
    } else {
      createGoal(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Nome da Meta *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ex: Viagem para o Japão"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm bg-white"
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-700">
            Valor Total *
          </label>
          <CurrencyInput
            id="targetAmount"
            name="targetAmount"
            required
            value={targetAmount}
            onChange={setTargetAmount}
            disabled={isPending}
            className="bg-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="currentAmount" className="block text-sm font-medium text-slate-700">
            Valor Atual
          </label>
          <CurrencyInput
            id="currentAmount"
            name="currentAmount"
            value={currentAmount}
            onChange={setCurrentAmount}
            disabled={isPending}
            className="bg-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="deadline" className="block text-sm font-medium text-slate-700">
          Data Alvo *
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm bg-white"
          disabled={isPending}
        />
      </div>

      <div className="pt-4 flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
          disabled={isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isPending ? 'Salvando...' : isEditing ? 'Atualizar Meta' : 'Salvar Meta'}
        </button>
      </div>
    </form>
  );
}
