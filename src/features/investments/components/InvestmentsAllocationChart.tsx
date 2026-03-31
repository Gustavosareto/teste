import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Typography } from '../../../components/ui/Typography';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Asset } from '../../finance/types';
import { usePrivacyMode } from '../../../providers/PrivacyProvider';

interface Props {
  assets: Asset[];
}

export function InvestmentsAllocationChart({ assets }: Props) {
  const { isPrivacyMode } = usePrivacyMode();

  // Group by type
  const groupedData = assets.reduce((acc, asset) => {
    const totalValue = asset.quantity * asset.currentPrice;
    const existing = acc.find(item => item.name === asset.type);
    if (existing) {
      existing.value += totalValue;
    } else {
      acc.push({ name: asset.type, value: totalValue, color: asset.color || "#ccc" || "#ccc" });
    }
    return acc;
  }, [] as { name: string, value: number, color: string }[]);

  const totalPatrimony = groupedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 flex flex-col items-center">
      <Typography variant="h3" className="w-full text-left mb-6">Alocação da Carteira</Typography>
      
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={groupedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {groupedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value: any) => {
                const numericValue = typeof value === 'number' ? value : 0;
                if (isPrivacyMode) return '••••••';
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
              }}
              contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'transparent' }}
              wrapperClassName="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 shadow-xl rounded-xl border"
              itemStyle={{ color: 'inherit' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Typography variant="label" color="muted" className="text-xs">Total</Typography>
          <Typography variant="h3" className="text-lg">
            <CurrencyFormat value={totalPatrimony} />
          </Typography>
        </div>
      </div>

      <div className="w-full mt-6 space-y-3">
        {groupedData.sort((a,b) => b.value - a.value).map(item => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-slate-700 dark:text-slate-300">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium"><CurrencyFormat value={item.value} /></span>
              <span className="text-xs text-slate-400 ml-2">
                {((item.value / totalPatrimony) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}