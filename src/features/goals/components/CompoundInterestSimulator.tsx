import { useState } from 'react';
import { Typography } from '../../../components/ui/Typography';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

export function CompoundInterestSimulator() {
  const [initialAmount, setInitialAmount] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [years, setYears] = useState(5);
  const [interestRate, setInterestRate] = useState(10); // Anual

  const generateData = () => {
    const data = [];
    let currentTotal = initialAmount;
    let totalInvested = initialAmount;
    const monthlyRate = (interestRate / 100) / 12;

    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        data.push({
          year: `Ano ${year}`,
          total: Number(currentTotal.toFixed(2)),
          invested: Number(totalInvested.toFixed(2)),
          interest: 0
        });
        continue;
      }

      for (let month = 1; month <= 12; month++) {
        currentTotal = (currentTotal + monthlyContribution) * (1 + monthlyRate);
        totalInvested += monthlyContribution;
      }

      data.push({
        year: `Ano ${year}`,
        total: Number(currentTotal.toFixed(2)),
        invested: Number(totalInvested.toFixed(2)),
        interest: Number((currentTotal - totalInvested).toFixed(2))
      });
    }

    return data;
  };

  const data = generateData();
  const finalAmount = data[data.length - 1].total;
  const finalInvested = data[data.length - 1].invested;

  return (
    <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 mt-6">
      <div className="mb-6">
        <Typography variant="h3" className="flex items-center gap-2">
          <span>🚀</span> Simulador de Impacto Financeiro
        </Typography>
        <Typography variant="label" color="muted">
          Descubra onde você estará no futuro com o poder dos juros compostos.
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Configuração */}
        <div className="space-y-4 lg:col-span-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor Inicial (R$)</label>
            <input 
              type="number" 
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 border p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aporte Mensal (R$)</label>
            <input 
              type="number" 
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 border p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo (Anos)</label>
              <input 
                type="number" 
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 border p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Taxa (% a.a.)</label>
              <input 
                type="number" 
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 border p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            <Typography variant="body" className="text-emerald-800 text-sm mb-1">Em {years} anos você terá:</Typography>
            <Typography variant="h2" className="text-emerald-600 text-2xl drop-shadow-md dark:shadow-black/20">
              <CurrencyFormat value={finalAmount} />
            </Typography>
            <div className="mt-2 text-xs flex justify-between text-emerald-700/80">
              <span>Total Investido: <CurrencyFormat value={finalInvested} /></span>
              <span>Juros: <CurrencyFormat value={finalAmount - finalInvested} /></span>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="lg:col-span-2 h-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                tickFormatter={(value) => `R$${(value / 1000).toLocaleString('pt-BR')}k`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
                        <p className="text-emerald-600 text-sm font-medium"> Patrimônio: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[1].value as number)}</p>
                        <p className="text-slate-500 text-sm"> Investido: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value as number)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="invested" stroke="#94a3b8" fillOpacity={1} fill="url(#colorInvested)" />
              <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  );
}