 
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  
} from 'recharts';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { MonthlyCashFlowPoint } from '../../finance/types';

interface CashFlowChartProps {
  data: MonthlyCashFlowPoint[];
}

// Tooltip customizado para manter a consistência do Design System (Tailwind)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-white p-4 rounded-lg border border-slate-200 shadow-xl min-w-[200px]" 
        role="tooltip" 
        aria-live="assertive"
      >
        <p className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-inner" 
                  style={{ backgroundColor: entry.color }} 
                  aria-hidden="true" 
                />
                <span className="text-sm font-medium text-slate-600">
                  {entry.name === 'income' ? 'Receitas' : 'Despesas'}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                <CurrencyFormat value={entry.value || 0} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function CashFlowChart({ data }: CashFlowChartProps) {
  // Cores fixas mapeadas para o schema do Tailwind (success = emerald-600, error = red-600)
  const colors = {
    income: '#059669',
    expense: '#dc2626',
  };

  return (
    <div 
      className="w-full h-full min-h-[300px]" 
      aria-label="Gráfico de área mostrando a evolução de receitas contra despesas nos últimos meses"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.income} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.income} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.expense} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.expense} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value / 1000}k`}
            dx={-10}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          <Area
            type="monotone"
            dataKey="income"
            name="income"
            stroke={colors.income}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIncome)"
            activeDot={{ r: 6, strokeWidth: 0, fill: colors.income }}
          />
          
          <Area
            type="monotone"
            dataKey="expense"
            name="expense"
            stroke={colors.expense}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorExpense)"
            activeDot={{ r: 6, strokeWidth: 0, fill: colors.expense }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}