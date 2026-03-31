import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Typography } from '../ui/Typography';
import { usePrivacyMode } from '../../providers/PrivacyProvider';
import { useTheme } from 'next-themes';
import { Sun, Moon, Trash2, LayoutDashboard, Wallet, TrendingUp, Target, Receipt, Eye, EyeOff, Menu } from 'lucide-react';
import { AIChatbot } from '../ui/AIChatbot';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useResetAllData } from '../../features/finance/api/queries';

const navItems = [
  { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/dashboard/accounts', label: 'Contas bancárias', icon: Wallet },
  { to: '/dashboard/investments', label: 'Patrimônio', icon: TrendingUp },
  { to: '/dashboard/goals', label: 'Metas', icon: Target },
  { to: '/dashboard/bills', label: 'Boletos', icon: Receipt },
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-3 md:py-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <Typography variant="h3" as="p" className="dark:text-white truncate text-xl md:text-2xl font-bold">
                MyFinance Pro
              </Typography>
              <Typography variant="caption" color="muted" className="dark:text-slate-400 hidden sm:block">
                Controle financeiro pessoal inteligente
              </Typography>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
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
                {isPrivacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="hidden sm:flex rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none"
                  aria-label="Minha conta"
                >
                  Minha conta
                </button>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="sm:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none flex transition-transform active:scale-95"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
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

          <nav aria-label="Navegacao principal" className="-mx-4 px-4 md:mx-0 md:px-0">
            <ul className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
              {navItems.map((item) => (
                <li key={item.to} className="snap-start shrink-0">
                  <NavLink to={item.to} className={({ isActive }) => 
                    isActive 
                      ? 'flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-100 px-3 md:px-4 py-2 text-sm md:text-base font-medium text-white dark:text-slate-900 shadow-sm transition-all scale-100' 
                      : 'flex items-center gap-2 rounded-lg border border-transparent px-3 md:px-4 py-2 text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 focus-visible:outline-none active:scale-95'
                  } end>
                    {({ isActive }) => (
                      <>
                        <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500'}`} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8 md:px-6 lg:px-8 mb-20 md:mb-0">
        <Outlet />
      </main>

      <AIChatbot />
    </div>
  );
}
