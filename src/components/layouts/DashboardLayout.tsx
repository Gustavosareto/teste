import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Typography } from '../ui/Typography';
import { usePrivacyMode } from '../../providers/PrivacyProvider';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut, Trash2 } from 'lucide-react';
import { AIChatbot } from '../ui/AIChatbot';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useResetAllData } from '../../features/finance/api/queries';

const navItems = [
  { to: '/dashboard', label: 'Visão geral' },
  { to: '/dashboard/accounts', label: 'Contas bancárias' },
  { to: '/dashboard/investments', label: 'Patrimônio' },
  { to: '/dashboard/goals', label: 'Metas' },
  { to: '/dashboard/bills', label: 'Boletos e assinaturas' },
];

export function DashboardLayout() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { mutate: resetData, isPending } = useResetAllData();

  const handleReset = () => {
    resetData(undefined, {
      onSuccess: () => {
        setIsResetModalOpen(false);
        setIsMenuOpen(false);
        alert('Todos os dados foram resetados com sucesso!');
      },
      onError: (error) => {
        console.error('Erro ao resetar dados:', error);
        alert('Falha ao resetar dados. Verifique a conexão.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Pular para o conteudo principal
      </a>

      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Typography variant="h3" as="p" className="dark:text-white">
                MyFinance Pro
              </Typography>
              <Typography variant="caption" color="muted" className="dark:text-slate-400">
                Controle financeiro pessoal inteligente
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
                aria-label="Alternar tema"
                title={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                type="button"
                onClick={togglePrivacyMode}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
                aria-label={isPrivacyMode ? "Mostrar valores" : "Ocultar valores"}
                title={isPrivacyMode ? "Mostrar valores" : "Ocultar valores"}
              >
                {isPrivacyMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  aria-label="Abrir configuracoes de conta"
                >
                  Minha conta
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</p>
                    </div>
                    <button
                      onClick={() => setIsResetModalOpen(true)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      {isPending ? 'Resetando...' : 'Zerar todos os dados'}
                    </button>
                    {/* Aqui você pode adicionar outros itens de menu no futuro */}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ConfirmModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={handleReset}
            title="Zerar todos os dados?"
            message="Esta ação é irreversível. Todas as suas contas, transações, metas e boletos serão apagados permanentemente."
            confirmText={isPending ? "Zerando..." : "Sim, zerar tudo"}
            cancelText="Cancelar"
            isDestructive={true}
          />

          <nav aria-label="Navegacao principal">
            <ul className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => 
                    isActive 
                      ? 'rounded-lg bg-slate-900 dark:bg-white px-3 py-2 text-sm font-medium text-white dark:text-slate-900 shadow-sm transition-colors' 
                      : 'rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-white'
                  } end>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <Outlet />
      </main>

      <AIChatbot />
    </div>
  );
}
