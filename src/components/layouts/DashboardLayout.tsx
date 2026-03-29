import { NavLink, Outlet } from 'react-router-dom';
import { Typography } from '../ui/Typography';

const navItems = [
  { to: '/dashboard', label: 'Visao geral' },
  { to: '/dashboard/accounts', label: 'Contas bancarias' },
  { to: '/dashboard/goals', label: 'Metas' },
  { to: '/dashboard/bills', label: 'Boletos e assinaturas' },
];

function getNavClasses(isActive: boolean) {
  if (isActive) {
    return 'rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm';
  }

  return 'rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';
}

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Pular para o conteudo principal
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Typography variant="h3" as="p">
                MyFinance Pro
              </Typography>
              <Typography variant="caption" color="muted">
                Controle financeiro pessoal inteligente
              </Typography>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              aria-label="Abrir configuracoes de conta"
            >
              Minha conta
            </button>
          </div>

          <nav aria-label="Navegacao principal">
            <ul className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => getNavClasses(isActive)} end>
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
    </div>
  );
}
