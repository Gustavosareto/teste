import { FormEvent, useState, useEffect, useRef } from 'react';
import { useCreateAsset, useUpdateAsset } from '../../finance/api/queries';
import { Asset } from '../../finance/types';

interface AssetFormProps {
  initialData?: Asset;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BrapiSearchResult {
  stock: string;
  name: string;
  close: number;
  type: string;
  logo: string;
}

export function AssetForm({ initialData, onSuccess, onCancel }: AssetFormProps) {
  const isEditing = !!initialData;
  const { mutate: updateAsset, isPending: isUpdating } = useUpdateAsset();
  const { mutate: createAsset, isPending } = useCreateAsset();
  const [error, setError] = useState('');

  const [symbol, setSymbol] = useState(initialData?.symbol || '');
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'Ações');
  const [quantity, setQuantity] = useState<number | ''>(initialData?.quantity || '');
  const [averagePrice, setAveragePrice] = useState<number | ''>(initialData?.averagePrice || '');

  // Autocomplete states
  const [suggestions, setSuggestions] = useState<BrapiSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSymbolChange = async (value: string) => {
    setSymbol(value);
    if (value.length >= 2) {
      setIsSearching(true);
      try {
        const apiKey = import.meta.env.VITE_BRAPI_KEY; 
        const response = await fetch(`https://brapi.dev/api/quote/list?search=${value}&token=${apiKey}`);
        if (response.ok) {
          const data = await response.json();
          // Limitar a 10 sugestões e garantir que temos dados úteis
          const filtered = (data.stocks || []).slice(0, 10);
          setSuggestions(filtered);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Erro ao buscar ativos:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAsset = (asset: BrapiSearchResult) => {
    setSymbol(asset.stock);
    setName(asset.name);
    setAveragePrice(asset.close || '');
    
    // Tentar inferir o tipo
    if (asset.type === 'stock') setType('Ações');
    else if (asset.type === 'fund') setType('FIIs');
    else if (asset.type === 'crypto') setType('Criptomoeda');
    
    setShowSuggestions(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!symbol || !name || quantity === '' || averagePrice === '') {
      setError('Preencha os campos corretamente.');
      return;
    }

    const payload = {
      symbol: symbol.toUpperCase(),
      name,
      type,
      quantity: Number(quantity),
      averagePrice: Number(averagePrice),
      currentPrice: Number(averagePrice),
      color: type === 'Cripto' ? '#8b5cf6' : type === 'Ações' ? '#3b82f6' : type === 'Renda Fixa' ? '#10b981' : '#f59e0b'
    };

    if (isEditing && initialData) {
      updateAsset({ id: initialData.id, updates: payload }, {
        onSuccess: () => onSuccess(),
        onError: () => setError('Ocorreu um erro ao atualizar o ativo.')
      });
    } else {
      createAsset(payload, {
        onSuccess: () => onSuccess(),
        onError: () => setError('Ocorreu um erro ao salvar o ativo.')
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-900 dark:text-slate-100">
      {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium relative" ref={searchRef}>
          Código (Ticker) / Busca
          <div className="relative mt-1">
            <input 
              className="w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition-all" 
              value={symbol} 
              onChange={e => handleSymbolChange(e.target.value)} 
              onFocus={() => symbol.length >= 2 && setShowSuggestions(true)}
              placeholder="Ex: PETR4, BTC" 
              autoComplete="off"
              required 
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5 animate-spin h-5 w-5 border-2 border-slate-300 border-t-slate-800 rounded-full" />
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-[100] mt-1 w-[320px] sm:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in zoom-in duration-200">
                {suggestions.map((asset) => (
                  <button
                    key={asset.stock}
                    type="button"
                    onClick={() => handleSelectAsset(asset)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{asset.stock}</span>
                        {asset.close && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                            R$ {asset.close.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate block mt-0.5">{asset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </label>
        <label className="block text-sm font-medium">
          Nome da Empresa/Ativo
          <input className="mt-1 w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Petrobras" required />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Tipo de Ativo
        <select className="mt-1 w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none transition-all" value={type} onChange={e => setType(e.target.value)}>
          <option value="Ações">Ações</option>
          <option value="FIIs">FIIs</option>
          <option value="Criptomoeda">Criptomoeda</option>
          <option value="Renda Fixa">Renda Fixa</option>
          <option value="Outros">Outros</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Quantidade
          <input type="number" step="0.000001" min="0" className="mt-1 w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
        </label>
        <label className="block text-sm font-medium">
          Preço Médio / Cotação Atual (R$)
          <input type="number" step="0.01" min="0" className="mt-1 w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={averagePrice} onChange={e => setAveragePrice(Number(e.target.value))} required />
        </label>
      </div>

      <div className="pt-4 flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800" disabled={isPending || isUpdating}>Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-slate-900 border text-white rounded-md hover:bg-slate-800" disabled={isPending || isUpdating}>{(isPending || isUpdating) ? 'Salvando...' : isEditing ? 'Atualizar Ativo' : 'Salvar Ativo'}</button>
      </div>
    </form>
  );
}
