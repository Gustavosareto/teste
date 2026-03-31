import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';
import { ExpenseCategory } from '../../finance/types';

interface ExpenseDonutChartProps {
  data: ExpenseCategory[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-2xl p-3 text-white text-sm">
        <Typography variant="body" className="font-bold mb-1 opacity-90 text-xs uppercase tracking-wider">
          {data.category}
        </Typography>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-semibold text-lg text-white">
            <CurrencyFormat value={data.amount} />
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function ExpenseDonutChart({ data }: ExpenseDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="relative w-full h-[220px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey="amount"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="hover:opacity-80 transition-opacity duration-300 outline-none" 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Texto no centro do Donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Disp.</span>
        <span className="text-xl font-bold text-slate-900 dark:text-slate-100 dark:text-white leading-none">
          <CurrencyFormat value={total} showSymbol={false} />
        </span>
      </div>
    </div>
  );
}