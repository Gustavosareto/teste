
import React, { useRef, useState } from 'react';
import { Typography } from '../ui/Typography';
import { useAccounts, useCreateTransactionsBulk } from '../../features/finance/api/queries';
import { TransactionType, TransactionCategory } from '../../features/finance/types';

interface ImportTransactionsProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function ImportTransactions({ onSuccess, onClose }: ImportTransactionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: createTransactionsBulk } = useCreateTransactionsBulk();
  const { data: accounts } = useAccounts();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        let transactions: any[] = [];
        const defaultAccountId = accounts?.[0]?.id || '';

        if (!defaultAccountId) {
          setError('Nenhuma conta bancária encontrada. Crie uma conta antes de importar.');
          setIsImporting(false);
          return;
        }

        if (file.name.endsWith('.json')) {
          transactions = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split(/\r?\n/);
          // Tentar detectar o separador (vírgula ou ponto e vírgula)
          const firstLine = lines[0] || '';
          const separator = firstLine.includes(';') ? ';' : ',';
          
          transactions = lines.slice(1).filter(l => l.trim() !== '').map(line => {
            // Regex para lidar com vírgulas dentro de aspas (ex: "IOF de ""Eneba""")
            const regex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
            const values = line.split(regex).map(v => v.replace(/^"|"$/g, '').trim());
            
            const dateStr = values[0]; // YYYY-MM-DD
            const title = values[1];
            const rawAmount = values[2]?.replace(/[R$\s]/g, '').replace(',', '.') || '0';
            const amount = parseFloat(rawAmount);

            // Lógica para identificar receita ou despesa:
            const isIncome = amount < 0 || title?.toLowerCase().includes('pagamento recebido');

            return {
              description: title,
              amount: Math.abs(amount),
              type: (isIncome ? 'income' : 'expense') as TransactionType,
              category: ('Outros' as TransactionCategory),
              date: dateStr || new Date().toISOString(),
              accountId: defaultAccountId
            };
          });
        }

        console.log(`Processando ${transactions.length} transações para importação em lote...`);

        // Importar todas de uma vez (Bulk Insert)
        if (transactions.length > 0) {
          await createTransactionsBulk(transactions);
        }

        onSuccess();
        onClose();
      } catch (err) {
        console.error('Erro na importação:', err);
        setError('Falha ao processar o arquivo. Verifique o formato.');
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-6">
      <Typography variant="h3" className="mb-4">Importar Movimentações</Typography>
      <Typography variant="body" color="muted" className="mb-6">
        Selecione um arquivo CSV ou JSON. O CSV deve seguir o formato: <br />
        <code className="bg-slate-100 dark:bg-slate-800 p-1 rounded">descrição, valor, tipo (income/expense), categoria</code>
      </Typography>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-all"
      >
        <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <Typography variant="body" className="font-semibold">
          {isImporting ? 'Importando...' : 'Clique para selecionar seu arquivo'}
        </Typography>
        <Typography variant="body" color="muted" className="text-sm">
          CSV ou JSON
        </Typography>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv,.json"
          onChange={handleFileUpload}
        />
      </div>

      {error && (
        <Typography variant="body" className="text-red-500 mt-4 text-center">
          {error}
        </Typography>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
