import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminMatches from './pages/admin/AdminMatches';
import AdminNews from './pages/admin/AdminNews';
import AdminGalleries from './pages/admin/AdminGalleries';
import AdminGalleryDetail from './pages/admin/AdminGalleryDetail';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMessages from './pages/admin/AdminMessages';
import AdminLayout from './pages/admin/AdminLayout';
import Sitemap from './pages/Sitemap';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noticias/:id" element={<NewsDetail />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="jogadores" element={<AdminPlayers />} />
          <Route path="jogos" element={<AdminMatches />} />
          <Route path="noticias" element={<AdminNews />} />
          <Route path="galerias" element={<AdminGalleries />} />
          <Route path="galerias/:id" element={<AdminGalleryDetail />} />
          <Route path="configuracoes" element={<AdminSettings />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="mensagens" element={<AdminMessages />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
