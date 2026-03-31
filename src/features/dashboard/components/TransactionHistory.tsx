import { useState, useRef, useEffect, useMemo } from 'react';
import { useTransactions, useUpdateTransaction, useDeleteTransaction } from '../../finance/api/queries';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';
import { Skeleton } from '../../../components/ui/Skeleton';
import { usePrivacyMode } from '../../../providers/PrivacyProvider';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

export function TransactionHistory({ isFullView = false }: { isFullView?: boolean }) {
  const { data: transactions, isPending } = useTransactions();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();
  const { isPrivacyMode } = usePrivacyMode();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  // States para filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleSave = (id: string, originalAmount: number) => {
    const numValue = Number(editValue);
    if (!isNaN(numValue) && numValue !== originalAmount && numValue > 0) {
      updateTransaction({ id, updates: { amount: numValue } });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, originalAmount: number) => {
    if (e.key === 'Enter') handleSave(id, originalAmount);
    if (e.key === 'Escape') setEditingId(null);
  };

  const categories = useMemo(() => {
    if (!transactions) return [];
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    // Função helper para evitar recriar em cada filter se quiser otimizar mais, 
    // mas aqui o custo é baixo.
    const isInstallmentCheck = (desc: string) => {
      const match = desc.match(/\s+(?:-\s+)?\(?(\d{1,2})\/(\d{1,2})\)?\s*$/);
      return match !== null;
    };

    return transactions.filter((t) => {
      const isInstallment = isInstallmentCheck(t.description);
      
      const matchSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === 'all' || t.category === filterCategory || (filterCategory === 'Parcelas' && isInstallment);
      const matchType = filterType === 'all' || t.type === filterType;
      
      return matchSearch && matchCategory && matchType;
    });
  }, [transactions, searchQuery, filterCategory, filterType]);

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Skeleton width="w-10" height="h-10" rounded="full" />
              <div className="space-y-2">
                <Skeleton width="w-32" height="h-4" />
                <Skeleton width="w-20" height="h-3" />
              </div>
            </div>
            <Skeleton width="w-24" height="h-6" />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <Typography variant="body" color="muted">Nenhuma transação recente encontrada.</Typography>
      </div>
    );
  }

  const parseInstallment = (desc: string) => {
    // Procura por formatos como " 1/3", " (1/3)", " - 01/10" no fim da string
    const match = desc.match(/\s+(?:-\s+)?\(?(\d{1,2})\/(\d{1,2})\)?\s*$/);
    if (!match) return null;
    return {
      current: parseInt(match[1]),
      total: parseInt(match[2]),
      cleanText: desc.replace(match[0], '').trim()
    };
  };

  const displayedTransactions = isFullView ? filteredTransactions : (transactions?.slice(0, 5) || []);

  return (
    <div className="space-y-4">
      {isFullView && (
        <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder="Buscar movimentação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-slate-300 dark:border-slate-700 shadow-sm focus:border-slate-900 focus:ring-slate-900 dark:focus:ring-slate-100 sm:text-sm border p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <div className="flex gap-2 text-sm">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 shadow-sm focus:border-slate-900 focus:ring-slate-900 dark:focus:ring-slate-100 sm:text-sm border p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="all">Todas Entradas/Saídas</option>
              <option value="income">Apenas Receitas (+)</option>
              <option value="expense">Apenas Despesas (-)</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 shadow-sm focus:border-slate-900 focus:ring-slate-900 dark:focus:ring-slate-100 sm:text-sm border p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Parcelas">🌟 Apenas Parcelas</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {displayedTransactions.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Typography variant="body" color="muted">Nenhuma transação encontrada com esses filtros.</Typography>
        </div>
      ) : (
        <div className={`space-y-3 ${isFullView ? 'max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
          {displayedTransactions.map((transaction) => {
            const installmentInfo = parseInstallment(transaction.description);
            const displayName = installmentInfo ? installmentInfo.cleanText : transaction.description;

            return (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-700 transition-all hover:shadow-md dark:shadow-black/20 group relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-full z-10 ${
                transaction.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                {transaction.type === 'income' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                )}
              </div>
              <div className="z-10">
                <Typography variant="body" className="font-bold text-slate-800 dark:text-slate-200 dark:text-slate-100 leading-tight">
                  {displayName}
                </Typography>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    {transaction.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </span>
                  {installmentInfo && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {installmentInfo.current}/{installmentInfo.total}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 z-10">
              {editingId === transaction.id && !isPrivacyMode ? (
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm font-medium text-slate-500">R$</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSave(transaction.id, transaction.amount)}
                    onKeyDown={(e) => handleKeyDown(e, transaction.id, transaction.amount)}
                    className="w-24 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
                  />
                </div>
              ) : (
                <div 
                  className={`flex items-center gap-1 font-bold tabular-nums cursor-pointer hover:underline decoration-dashed underline-offset-4 decoration-slate-300 dark:decoration-slate-600 ${isPrivacyMode ? 'cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (!isPrivacyMode) {
                      setEditValue(transaction.amount.toString());
                      setEditingId(transaction.id);
                    }
                  }}
                  title={isPrivacyMode ? "" : "Clique para editar"}
                >
                  <span className={transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {transaction.type === 'income' ? '+' : '-'}
                  </span>
                  <CurrencyFormat value={transaction.amount} type={transaction.type as 'income' | 'expense'} />
                </div>
              )}

              {/* Botão de Excluir */}
              <button
                onClick={() => setTransactionToDelete(transaction.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all focus:opacity-100"
                title="Excluir movimentação"
                aria-label="Excluir movimentação"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            {/* Barra de progresso da parcela no background */}
            {installmentInfo && (
               <div 
                 className="absolute bottom-0 left-0 h-1 bg-amber-500/20" 
                 style={{ width: `${(installmentInfo.current / installmentInfo.total) * 100}%` }}
               />
            )}
          </div>
        );
      })}
      </div>
      )}

      <ConfirmModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        title="Excluir Movimentação"
        message="Tem certeza que deseja excluir esta movimentação permanentemente? Isso vai afetar os saldos e o histórico."
        confirmText="Excluir"
        isDestructive={true}
        onConfirm={() => {
          if (transactionToDelete) {
            deleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }
        }}
      />
    </div>
  );
}