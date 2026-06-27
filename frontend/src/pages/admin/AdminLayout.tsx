import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import AccessibilityBar from '../../components/AccessibilityBar';
import { api } from '../../api/client';

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/jogadores', label: 'Jogadores', icon: '🏀' },
  { path: '/admin/jogos', label: 'Jogos', icon: '📅' },
  { path: '/admin/noticias', label: 'Notícias', icon: '📰' },
  { path: '/admin/galerias', label: 'Galerias', icon: '🖼️' },
  { path: '/admin/parceiros', label: 'Parceiros', icon: '🤝' },
  { path: '/admin/eventos', label: 'Eventos', icon: '📆' },
  { path: '/admin/usuarios', label: 'Usuários', icon: '👤', adminOnly: true },
  { path: '/admin/mensagens', label: 'Mensagens', icon: '✉️' },
  { path: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function AdminLayout() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    const token = localStorage.getItem('token');
    if (!stored || !token) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    if (!admin) return;
    api.stats.get().then((s) => setUnreadMessages(s.unreadMessages)).catch(() => {});
    const interval = setInterval(() => {
      api.stats.get().then((s) => setUnreadMessages(s.unreadMessages)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [admin]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="p-5 border-b border-gray-700">
          <h2 className="font-bold text-lg">Admin BCR</h2>
          <p className="text-sm text-gray-400 mb-2">{admin.name}</p>
          <AccessibilityBar />
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS
            .filter((item) => !('adminOnly' in item) || admin?.role === 'admin')
            .map((item) => (
            <Link key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}>
              <span>{item.icon}</span>
              {item.label}
              {item.path === '/admin/mensagens' && unreadMessages > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full transition-colors">
            🚪 Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={sidebarOpen} className="p-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 font-semibold text-gray-900">Admin BCR</span>
          <div className="ml-auto">
            <AccessibilityBar />
          </div>
        </header>
        <main id="main-content" className="flex-1 p-6">
          <Outlet context={admin} />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
