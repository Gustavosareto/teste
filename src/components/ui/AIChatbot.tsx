import React, { useState, useRef, useEffect } from 'react';
import { 
  useCreateTransaction, 
  useCreateBill, 
  useCreateAsset, 
  useCreateAccount, 
  useDeleteAccount, 
  useTransactions,
  useAccounts,
  useAssets,
  useBills
} from '../../features/finance/api/queries';

import { Typography } from './Typography';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';
import { Modal } from './Modal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// Inicializações seguras de API de Speech Recognition nativas do browser
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function AIChatbot() {
  const { mutateAsync: createAsset } = useCreateAsset();
  const { mutateAsync: createAccount } = useCreateAccount();
  const { mutateAsync: deleteAccount } = useDeleteAccount();
  const { mutateAsync: createTransaction } = useCreateTransaction();
  const { mutateAsync: createBill } = useCreateBill();

  const { data: transactions } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: assets } = useAssets();
  const { data: bills } = useBills();

  const [isOpen, setIsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Olá! Sou seu assistente financeiro de IA. Posso gerenciar suas contas, transações, investimentos e dar um resumo da sua saúde financeira. Como posso ajudar?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const parseAndExecute = async (text: string) => {
    try {
      setIsTyping(true);
      const apiKey = 'AIzaSyDWkAfP85Gj8gz9PjAnhlCAM1CKAq9ExWE';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      // Gerar contexto financeiro atual para o resumo
      const contextSummary = {
        totalAccounts: accounts?.length || 0,
        accounts: accounts?.map(a => ({ name: a.name, balance: a.currentBalance, institution: a.institution })),
        totalAssets: assets?.length || 0,
        recentTransactions: transactions?.slice(0, 5).map(t => ({ desc: t.description, amount: t.amount, type: t.type })),
        pendingBills: bills?.filter(b => b.status === 'pendente').length || 0,
        totalBillsAmount: bills?.filter(b => b.status === 'pendente').reduce((acc, b) => acc + b.amount, 0) || 0
      };

      const prompt = `Você é um Agente Financeiro Pessoal altamente capacitado. Seu objetivo é ajudar o usuário a gerenciar suas finanças de forma proativa.
Você tem acesso ao contexto financeiro atual do usuário: ${JSON.stringify(contextSummary)}.

Instruções:
- Se o usuário pedir um resumo, analise os dados acima e dê um panorama real (saldo total, contas críticas, gastos recentes). Seja analítico e amigável.
- Se o usuário pedir para criar/excluir conta, use as ações abaixo.
- Você deve retornar APENAS um objeto JSON válido.

Ações possíveis (retorne apenas uma no JSON):
1. createTransaction: { "action": "createTransaction", "type": "income"|"expense", "amount": numero, "category": string, "description": string, "installments": numero, "accountName": string (opcional) }
2. createBill: { "action": "createBill", "amount": numero, "name": string, "dueDay": numero, "type": "boleto"|"assinatura" }
3. createAsset: { "action": "createAsset", "symbol": string, "name": string, "type": "Ações"|"Cripto"|"Renda Fixa"|"FIIs", "quantity": numero, "averagePrice": numero }
4. createBankContext: { "action": "createBankContext", "name": string, "currentBalance": numero, "institution": string, "type": "corrente"|"poupanca"|"investimento" }
5. deleteBankContext: { "action": "deleteBankContext", "accountName": string }
6. chat: { "action": "chat", "message": "sua resposta analítica baseada nos dados ou resposta comum" }

Frase do usuário: "${text}"`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      const data = await response.json();
      setIsTyping(false);
      
      if (!response.ok || !data.candidates || data.candidates.length === 0) {
        throw new Error('Falha na API Gemini');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      // --- LOGICA DE EXECUÇÃO ---

      if (parsed.action === 'createBankContext') {
        await createAccount({
          name: parsed.name,
          currentBalance: Number(parsed.currentBalance),
          institution: parsed.institution,
          type: parsed.type as any
        });
        return `🏦 Nova conta "${parsed.name}" no ${parsed.institution} criada com sucesso com saldo inicial de R$ ${parsed.currentBalance}.`;
      }

      if (parsed.action === 'deleteBankContext') {
        const acc = accounts?.find(a => a.name.toLowerCase().includes(parsed.accountName.toLowerCase()));
        if (acc) {
          await deleteAccount(acc.id);
          return `🗑️ A conta "${acc.name}" foi removida conforme solicitado.`;
        }
        return `❌ Não encontrei nenhuma conta com o nome "${parsed.accountName}" para excluir.`;
      }

      if (parsed.action === 'createAsset') {
        await createAsset({
          symbol: parsed.symbol,
          name: parsed.name,
          type: parsed.type as any,
          quantity: Number(parsed.quantity),
          averagePrice: Number(parsed.averagePrice),
          currentPrice: Number(parsed.averagePrice),
          color: parsed.type === 'Cripto' ? '#8b5cf6' : parsed.type === 'Ações' ? '#3b82f6' : '#10b981'
        });
        return `📈 Ativo ${parsed.symbol} (${parsed.name}) adicionado ao seu patrimônio!`;
      }

      if (parsed.action === 'createTransaction') {
        const descriptionSafe = (parsed.description && parsed.description.length > 0) ? parsed.description : 'Nova Transação';
        
        let accId = accounts?.[0]?.id || '';
        if (parsed.accountName) {
            const found = accounts?.find(a => a.name.toLowerCase().includes(parsed.accountName.toLowerCase()));
            if (found) accId = found.id;
        }

        if (!accId) return "❌ Você precisa ter pelo menos uma conta bancária cadastrada para adicionar transações.";

        const installments = Number(parsed.installments) || 1;
        if (installments > 1 && parsed.type === 'expense') {
          const installmentAmount = Number(parsed.amount) / installments;
          for (let i = 1; i <= installments; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + (i - 1));
            await createTransaction({
              type: 'expense',
              amount: Number(installmentAmount.toFixed(2)),
              category: (parsed.category || 'Outros') as any,
              description: `${descriptionSafe} ${i}/${installments}`,
              accountId: accId,
              date: date.toISOString()
            });
          }
          return `✅ Agendei ${installments} parcelas de R$ ${installmentAmount.toFixed(2)} para "${descriptionSafe}"!`;
        }

        await createTransaction({
          type: parsed.type === 'income' ? 'income' : 'expense',
          amount: Number(parsed.amount),
          category: (parsed.category || 'Outros') as any,
          description: descriptionSafe,
          accountId: accId,
          date: new Date().toISOString()
        });
        return `✅ Adicionado: ${parsed.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${Number(parsed.amount).toFixed(2)} (${descriptionSafe}).`;
      }

      if (parsed.action === 'createBill') {
        await createBill({
          name: parsed.name || 'Nova Conta',
          amount: Number(parsed.amount),
          dueDay: parsed.dueDay || 10,
          status: 'pendente',
          type: parsed.type === 'assinatura' ? 'assinatura' : 'boleto'
        });
        return `📅 Conta agendada: ${parsed.name} (R$ ${Number(parsed.amount).toFixed(2)}) para o dia ${parsed.dueDay}.`;
      }

      if (parsed.action === 'chat') {
        return parsed.message;
      }

      return "Entendi seu pedido, mas não consegui mapear para uma ação financeira. Pode detalhar melhor?";

    } catch (e) {
      setIsTyping(false);
      console.error(e);
      return "Ops! Tive um problema ao processar seu pedido. Tente novamente.";
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!SpeechRecognitionAPI) {
      setAlertMessage('O reconhecimento de voz não é suportado neste navegador.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => prev + (prev.length > 0 ? ' ' : '') + transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const loadingId = Date.now().toString() + 'loading';
    setMessages(prev => [...prev, { id: loadingId, role: 'assistant', text: 'Digitando...' }]);

    const responseText = await parseAndExecute(userMessage.text);

    setMessages(prev => 
      prev.map(msg => msg.id === loadingId ? { ...msg, text: responseText } : msg)
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg dark:shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 z-50 group"
        aria-label="Abrir assistente IA"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <Sparkles className="w-6 h-6 group-hover:animate-pulse text-yellow-200" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-black/50 flex flex-col z-50 overflow-hidden ring-1 ring-black/5">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-yellow-200" />
              </div>
              <div>
                <Typography variant="h4" className="text-white text-base">Agente MyFinance</Typography>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <Typography variant="body" className="text-indigo-200 text-[10px] uppercase font-bold tracking-wider">Online</Typography>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white border-transparent rounded-tr-sm shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700 rounded-tl-sm'
                }`}>
                  <Typography variant="body" className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text === 'Digitando...' ? (
                      <span className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    ) : msg.text}
                  </Typography>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse ring-4 ring-red-50' 
                    : 'bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:bg-slate-800'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte ou peça algo..."
                disabled={isTyping}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 dark:text-white transition-all placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      <Modal 
        isOpen={!!alertMessage} 
        onClose={() => setAlertMessage(null)} 
        title="Atenção"
      >
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-center text-slate-700 dark:text-slate-300 font-medium text-lg">
            {alertMessage}
          </p>
          <button 
            type="button" 
            onClick={() => setAlertMessage(null)} 
            className="mt-6 w-full btn-primary py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Entendi
          </button>
        </div>
      </Modal>
    </>
  );
}
