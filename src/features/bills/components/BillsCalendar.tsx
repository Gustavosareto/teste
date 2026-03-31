import { RecurringBill } from '../../finance/types';

interface BillsCalendarProps {
  bills: RecurringBill[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

export function BillsCalendar({ bills, selectedDay, onSelectDay }: BillsCalendarProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = currentDate.getDate();

  // Gerar array de dias 1 a N
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Mapear boletos por dia
  const billsByDay = bills.reduce((acc, bill) => {
    if (!acc[bill.dueDay]) {
      acc[bill.dueDay] = [];
    }
    acc[bill.dueDay].push(bill);
    return acc;
  }, {} as Record<number, RecurringBill[]>);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
        </h3>
        {selectedDay && (
          <button 
            onClick={() => onSelectDay(null)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-200"
          >
            Limpar filtro
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">
            {d}
          </div>
        ))}
        
        {/* Espaços vazios no início (apenas ilustrativo, ignorando dia da semana real para o mock ou calculando certo) */}
        {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {daysArray.map((day) => {
          const hasBills = !!billsByDay[day];
          const hasPending = billsByDay[day]?.some(b => b.status === 'pendente');
          const isSelected = selectedDay === day;
          const isToday = day === currentDay;

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`
                relative h-12 w-full rounded-lg flex flex-col items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:ring-offset-1
                ${isSelected ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50'}
                ${isToday && !isSelected ? 'font-bold ring-1 ring-inset ring-slate-200 bg-slate-50 dark:bg-slate-800/50' : ''}
              `}
              aria-label={`Dia ${day}${hasBills ? ', possui boletos' : ''}`}
              aria-pressed={isSelected}
            >
              <span className={`z-10 ${isSelected ? 'text-white' : ''}`}>{day}</span>
              {hasBills && (
                <span 
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-slate-900' : hasPending ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  aria-hidden="true" 
                />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pago
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-900"></span> Selecionado
        </span>
      </div>
    </div>
  );
}
