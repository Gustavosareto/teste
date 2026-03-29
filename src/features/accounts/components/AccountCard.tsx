import { BankAccount } from '../../finance/types';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';
import { useDeleteAccount } from '../../finance/api/queries';

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

  return (
    <article className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(account)}
          className="p-1.5 text-slate-400 hover:text-slate-900 bg-white rounded-md border border-slate-200 shadow-sm hover:bg-slate-50 relative z-10"
          title="Editar conta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Tem certeza que deseja remover esta conta?')) {
              deleteAccount(account.id);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 bg-white rounded-md border border-slate-200 shadow-sm hover:bg-red-50 relative z-10"
          title="Remover conta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4 pr-16">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm border border-black/5 ${colorClass}`}>
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
        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 capitalize border border-slate-200">
          {account.type}
        </span>
      </div>

      <div className="mt-6 pt-4 justify-between flex items-end border-t border-slate-50">
        <div>
          <Typography variant="body" color="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">
            Saldo Atual
          </Typography>
          <Typography variant="h2" as="p" className="text-2xl">
            <CurrencyFormat value={account.currentBalance} />
          </Typography>
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center">
         <Typography variant="body" className="text-xs text-slate-400">
            Atualizado em: {new Date(account.lastUpdate).toLocaleDateString('pt-BR')}
        </Typography>
      </div>
    </article>
  );
}
