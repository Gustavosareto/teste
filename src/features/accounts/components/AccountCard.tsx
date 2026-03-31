import { useState, useRef, useEffect } from 'react';
import { BankAccount } from '../../finance/types';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';
import { useDeleteAccount, useUpdateAccount } from '../../finance/api/queries';
import { usePrivacyMode } from '../../../providers/PrivacyProvider';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface AccountCardProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
}

const getInitials = (name: string) => {
  return name.substring(0, 2).toUpperCase();
};

const bankColors: Record<string, string> = {
  'Nubank': 'bg-purple-600',
  'Banco Inter': 'bg-orange-500',
  'XP Investimentos': 'bg-black',
  'C6 Bank': 'bg-gray-800',
  'Banco do Brasil': 'bg-yellow-400 text-black',
  'Itaú': 'bg-orange-400 text-blue-900',
  'Bradesco': 'bg-orange-500 text-white',
  'Santander': 'bg-red-600',
};

const defaultColor = 'bg-slate-800 text-white';

export function AccountCard({ account, onEdit }: AccountCardProps) {
  const colorClass = bankColors[account.institution] || defaultColor;
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const { mutate: updateAccount } = useUpdateAccount();
  const { isPrivacyMode } = usePrivacyMode();
  
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editValue, setEditValue] = useState(account.currentBalance.toString());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingAmount && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingAmount]);

  const handleSaveAmount = () => {
    const numValue = Number(editValue);
    if (!isNaN(numValue) && numValue !== account.currentBalance) {
      updateAccount({ id: account.id, updates: { currentBalance: numValue } });
    }
    setIsEditingAmount(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveAmount();
    if (e.key === 'Escape') {
      setEditValue(account.currentBalance.toString());
      setIsEditingAmount(false);
    }
  };

  return (
    <article className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 hover:shadow-md transition-shadow relative group ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(account)}
          className="p-1.5 text-slate-400 hover:text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 hover:bg-slate-50 dark:bg-slate-800/50 relative z-10"
          title="Editar conta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative z-10"
          title="Remover conta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4 pr-16">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md dark:shadow-black/20 border border-black/5 ${colorClass}`}>
          {getInitials(account.institution)}
        </div>
        <div className="flex-1 min-w-0">
          <Typography variant="h3" className="truncate">{account.name}</Typography>
          <Typography variant="body" color="muted" className="text-sm truncate">
            {account.institution}
          </Typography>
        </div>
      </div>
      <div className="mt-3">
        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-800">
          {account.type}
        </span>
      </div>

      <div className="mt-6 pt-4 justify-between flex items-end border-t border-slate-50 dark:border-slate-800/50">
        <div className="flex-1">
          <Typography variant="body" color="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">
            Saldo Atual
          </Typography>
          {isEditingAmount && !isPrivacyMode ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">R$</span>
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveAmount}
                onKeyDown={handleKeyDown}
                className="w-32 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-lg font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          ) : (
            <Typography 
              variant="h2" 
              as="p" 
              className={`text-2xl cursor-pointer hover:underline decoration-dashed underline-offset-4 decoration-slate-300 ${isPrivacyMode ? 'cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!isPrivacyMode) {
                  setEditValue(account.currentBalance.toString());
                  setIsEditingAmount(true);
                }
              }}
              title={isPrivacyMode ? "" : "Clique para editar rapidamente"}
            >
              <CurrencyFormat value={account.currentBalance} />
            </Typography>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center">
         <Typography variant="body" className="text-xs text-slate-400">
            Atualizado em: {new Date(account.lastUpdate).toLocaleDateString('pt-BR')}
        </Typography>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Remover Conta"
        message="Tem certeza que deseja remover esta conta bancária? As movimentações atreladas a ela poderão ser afetadas."
        confirmText="Remover"
        isDestructive={true}
        onConfirm={() => {
          deleteAccount(account.id);
          setIsConfirmOpen(false);
        }}
      />
    </article>
  );
}
