import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { AssetForm } from './components/AssetForm';
import { PageMetadata } from '../../components/seo/PageMetadata';
import { Typography } from '../../components/ui/Typography';
import { useAssets, useSyncB3Assets, useTopCryptos } from '../finance/api/queries';
import { InvestmentsAllocationChart } from './components/InvestmentsAllocationChart';
import { AssetsList } from './components/AssetsList';
import { CurrencyFormat } from '../../components/ui/CurrencyFormat';
import { Skeleton } from '../../components/ui/Skeleton';

export function InvestmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<import('../finance/types').Asset | undefined>();
  const { data: assets, isLoading } = useAssets();
  const { mutate: syncB3, isPending: isSyncing } = useSyncB3Assets();
  const { data: topCryptos, isLoading: isLoadingCryptos } = useTopCryptos();

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <Skeleton width="w-64" height="h-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton height="h-32" />
          <Skeleton height="h-32" />
          <Skeleton height="h-32" />
        </div>
      </div>
    );
  }

  const assetsList = assets || [];
  const totalPatrimony = assetsList.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.currentPrice)), 0);
  const totalInvested = assetsList.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.averagePrice)), 0);
  const totalProfitLine = totalPatrimony - totalInvested;
  const isProfit = totalProfitLine >= 0;

  if (assetsList.length === 0) {
    return (
      <div className="space-y-8">
        <PageMetadata title="Gestão Patrimonial | MyFinance Pro" description="Seus investimentos" />
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Typography variant="h1">Gestão Patrimonial</Typography>
            <Typography variant="body" color="muted" className="mt-1">
              Você ainda não possui ativos cadastrados no seu banco de dados.
            </Typography>
          </div>
          <button onClick={() => { setEditingAsset(undefined); setIsModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg">Adicionar Primeiro Ativo</button>
        </header>

        <section className="bg-slate-50 dark:bg-slate-900/50 p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
            <Typography variant="body" color="muted">Clique em "Adicionar Ativo" ou peça para a IA cadastrar seus investimentos para começar.</Typography>
        </section>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? 'Editar Ativo' : 'Adicionar Novo Ativo'}>
          <AssetForm initialData={editingAsset} onSuccess={() => { setIsModalOpen(false); setEditingAsset(undefined); }} onCancel={() => { setIsModalOpen(false); setEditingAsset(undefined); }} />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageMetadata
        title="Gestão Patrimonial | MyFinance Pro"
        description="Acompanhe seus investimentos, alocação de carteira e rentabilidade geral do seu patrimônio."
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h1">Gestão Patrimonial</Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Consolide todas as suas contas, aplicações e ativos em um único lugar.
          </Typography>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => syncB3()} 
            disabled={isSyncing}
            className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-800 rounded-lg shadow-md dark:shadow-black/20 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Sincronizando...
              </>
            ) : "Sincronizar B3"}
          </button>
          <button onClick={() => { setEditingAsset(undefined); setIsModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-md dark:shadow-black/20 hover:bg-slate-800 transition-colors">Adicionar Ativo</button>
        </div>
      </header>

      {/* Patrimony Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20">
          <Typography variant="label" color="muted" className="mb-2 block uppercase tracking-wider">Patrimônio Total</Typography>
          <Typography variant="h2" className="text-3xl text-slate-900 dark:text-slate-100 mb-1">
            <CurrencyFormat value={totalPatrimony} />
          </Typography>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20">
          <Typography variant="label" color="muted" className="mb-2 block uppercase tracking-wider">Valor Aplicado</Typography>
          <Typography variant="h2" className="text-3xl text-slate-600 mb-1">
            <CurrencyFormat value={totalInvested} />
          </Typography>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 relative overflow-hidden">
           <Typography variant="label" color="muted" className="mb-2 block uppercase tracking-wider">Rentabilidade (Geral)</Typography>
           <div className={`flex items-baseline gap-2 ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
             <Typography variant="h2" className="text-3xl mb-1 text-slate-900 dark:text-slate-100">
               <CurrencyFormat value={Math.abs(totalProfitLine)} />
             </Typography>
             <span className={`font-semibold px-2 py-0.5 rounded text-sm bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
               {isProfit ? '+' : '-'}{totalInvested > 0 ? ((Math.abs(totalProfitLine) / totalInvested) * 100).toFixed(2) : '0.00'}%
             </span>
           </div>
           
           <svg className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.05] ${isProfit ? 'text-emerald-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 24 24">
             {isProfit 
               ? <path d="M2.25 18L12 8.25l4.5 4.5L24 5.25v6L16.5 18.75l-4.5-4.5-8.25 8.25Z" />
               : <path d="M2.25 6L12 15.75l4.5-4.5L24 18.75v-6L16.5 5.25l-4.5 4.5-8.25-8.25Z" />
             }
           </svg>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InvestmentsAllocationChart assets={assetsList} />
        <AssetsList assets={assetsList} onEdit={(asset) => { setEditingAsset(asset); setIsModalOpen(true); }} />
      </section>

      {/* Top 10 Criptos Mais Famosas */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="h3">Criptomoedas Populares</Typography>
            <Typography variant="label" color="muted">As 10 moedas com maior capitalização de mercado</Typography>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brapi Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {isLoadingCryptos ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-2">
                <Skeleton width="w-12" height="h-12" rounded="full" />
                <Skeleton width="w-20" height="h-4" />
                <Skeleton width="w-16" height="h-3" />
              </div>
            ))
          ) : topCryptos?.map((crypto: any) => (
            <div key={crypto.coin} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <img src={crypto.coinImageUrl} alt={crypto.coinName} className="w-8 h-8 rounded-full shadow-sm" />
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${crypto.marketCapChangePercentage24h >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                  {crypto.marketCapChangePercentage24h > 0 ? '+' : ''}{crypto.marketCapChangePercentage24h?.toFixed(2)}%
                </span>
              </div>
              <Typography variant="label" className="font-bold text-slate-900 dark:text-slate-100 block truncate">{crypto.coinName}</Typography>
              <Typography variant="caption" color="muted" className="uppercase mb-2 block">{crypto.coin}</Typography>
              <Typography variant="body" className="font-semibold text-slate-700 dark:text-slate-300">
                <CurrencyFormat value={crypto.regularMarketPrice} />
              </Typography>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? 'Editar Ativo' : 'Adicionar Novo Ativo'}>
        <AssetForm initialData={editingAsset} onSuccess={() => { setIsModalOpen(false); setEditingAsset(undefined); }} onCancel={() => { setIsModalOpen(false); setEditingAsset(undefined); }} />
      </Modal>
    </div>
  );
}
