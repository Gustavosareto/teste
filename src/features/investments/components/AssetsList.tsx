import { Asset } from '../../finance/types';
import { Typography } from '../../../components/ui/Typography';
import { useDeleteAsset } from '../../finance/api/queries';
import { Edit2, Trash2 } from 'lucide-react';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { useState } from 'react';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface Props {
  assets: Asset[];
}

export function AssetsList({ assets, onEdit }: Props & { onEdit?: (asset: Asset) => void }) {
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset();
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        <svg className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  return (
    <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 col-span-1 lg:col-span-2">
      <Typography variant="h3" className="mb-6">Meus Ativos</Typography>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-3 bg-white dark:bg-slate-900 font-medium">Ativo</th>
              <th className="pb-3 bg-white dark:bg-slate-900 font-medium text-right">Qtd.</th>
              <th className="pb-3 bg-white dark:bg-slate-900 font-medium text-right">Preço Médio</th>
              <th className="pb-3 bg-white dark:bg-slate-900 font-medium text-right">Preço Atual</th>
              <th className="pb-3 bg-white dark:bg-slate-900 font-medium text-right">Rentabilidade</th>
              <th className="pb-3 bg-white dark:bg-slate-900 font-medium text-right">Total</th>
              <th className="pb-3 bg-white dark:bg-slate-900 font-medium text-right pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {assets.map((asset) => {
              const totalValue = asset.quantity * asset.currentPrice;
              const investedValue = asset.quantity * asset.averagePrice;
              const profitPercentage = ((totalValue - investedValue) / investedValue) * 100;

              return (
                <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: asset.color }}
                      >
                        {asset.symbol.substring(0,2)}
                      </div>
                      <div>
                        <Typography variant="body" className="font-semibold text-slate-900 dark:text-slate-100">{asset.symbol}</Typography>
                        <span className="text-xs text-slate-500 block truncate max-w-[120px] lg:max-w-none">{asset.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right text-sm text-slate-600">{asset.quantity}</td>
                  <td className="py-4 text-right text-sm text-slate-600">
                    <CurrencyFormat value={asset.averagePrice} />
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                    <CurrencyFormat value={asset.currentPrice} />
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end">
                      {formatPercentage(profitPercentage)}
                    </div>
                  </td>
                  <td className="py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                    <CurrencyFormat value={totalValue} />
                  </td>
                  <td className="py-4 text-right pr-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit && onEdit(asset)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar / Adicionar Cotas">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setAssetToDelete(asset.id)} disabled={isDeleting} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        title="Excluir Ativo"
        message="Tem certeza que deseja excluir permanentemente este ativo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        isDestructive={true}
        onConfirm={() => {
          if (assetToDelete) {
            deleteAsset(assetToDelete);
            setAssetToDelete(null);
          }
        }}
      />
    </article>
  );
}