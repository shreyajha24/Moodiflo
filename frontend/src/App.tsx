import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { RootLayout } from './layouts/RootLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { MoodsPage } from './pages/MoodsPage';
import { MoodDetailPage } from './pages/MoodDetailPage';
import { SongsPage } from './pages/SongsPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <PlayerProvider>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="home" element={<HomePage />} />
                <Route path="moods" element={<MoodsPage />} />
                <Route path="moods/:name" element={<MoodDetailPage />} />
                <Route path="songs" element={<SongsPage />} />
                <Route path="songs/:id" element={<SongDetailPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="playlists" element={<PlaylistsPage />} />
                <Route path="playlists/:id" element={<PlaylistDetailPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </PlayerProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
