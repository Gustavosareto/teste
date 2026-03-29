import { FormEvent, useState } from 'react';
import { useCreateAccount, useUpdateAccount } from '../../finance/api/queries';
import { BankAccount, AccountType } from '../../finance/types';
import { CurrencyInput } from '../../../components/ui/CurrencyInput';

interface AccountFormProps {
  initialData?: BankAccount;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountForm({ initialData, onSuccess, onCancel }: AccountFormProps) {
  const isEditing = !!initialData;
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();
  
  const isPending = isCreating || isUpdating;
  const [error, setError] = useState('');

  const [name, setName] = useState(initialData?.name || '');
  const [institution, setInstitution] = useState(initialData?.institution || '');
  const [type, setType] = useState<AccountType>(initialData?.type || 'corrente');
  const [currentBalance, setCurrentBalance] = useState<number | undefined>(initialData?.currentBalance || 0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name || !institution || currentBalance === undefined) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      name,
      institution,
      type,
      currentBalance,
    };

    const handleSuccess = () => onSuccess();
    const handleError = () => setError('Ocorreu um erro. Tente novamente.');

    if (isEditing && initialData) {
      updateAccount(
        { id: initialData.id, updates: payload },
        { onSuccess: handleSuccess, onError: handleError }
      );
    } else {
      createAccount(payload, { onSuccess: handleSuccess, onError: handleError });
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
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nome da Conta *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: Conta Principal"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm bg-white"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="institution" className="block text-sm font-medium text-slate-700">
          Instituição / Banco *
        </label>
        <input
          type="text"
          id="institution"
          name="institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
          placeholder="Ex: Banco Inter, Nubank"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm bg-white"
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-slate-700">
            Tipo de Conta
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm bg-white"
            disabled={isPending}
          >
            <option value="corrente">Corrente</option>
            <option value="poupanca">Poupança</option>
            <option value="investimento">Investimento</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="currentBalance" className="block text-sm font-medium text-slate-700">
            Saldo Inicial
          </label>
          <CurrencyInput
            id="currentBalance"
            name="currentBalance"
            value={currentBalance}
            onChange={setCurrentBalance}
            disabled={isPending}
            className="bg-white"
          />
        </div>
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
          {isPending ? 'Salvando...' : isEditing ? 'Atualizar Conta' : 'Salvar Conta'}
        </button>
      </div>
    </form>
  );
}
