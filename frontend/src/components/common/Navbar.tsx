import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  ListMusic,
  LogOut,
  Search,
  Sun,
  Moon,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { spotifyService } from '../../services/spotifyService';
import { usePlayer } from '../../hooks/usePlayer';
import type { SongView } from '../../types';
import moodifloLogo from '../../assets/moodiflo-logo.svg';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { playSong } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SongView[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('moodiflo-theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('moodiflo-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      spotifyService.search(searchQuery, 0, 5)
        .then((list) => setSearchResults(list))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navPillClass = ({ isActive }: { isActive: boolean }) =>
    `nav-pill px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
      isActive
        ? 'bg-white/15 text-cyan-300 font-semibold shadow-inner border border-white/20'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="moodiflo-header sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-2xl border-b transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <NavLink
          to="/home"
          className="moodiflo-brand flex items-center gap-2.5 hover:opacity-95 transition-opacity"
        >
          <img src={moodifloLogo} alt="" className="h-11 w-13 object-contain drop-shadow-lg" />
          <span className="text-xl font-bold tracking-tight font-display">Moodiflo</span>
        </NavLink>

        {/* Center: Main Glass Navigation: Home | Sargam | Journey | Diary */}
        <nav
          className="moodiflo-nav flex items-center gap-1 sm:gap-1.5 rounded-full border px-3 py-1.5 shadow-xl backdrop-blur-2xl"
          aria-label="Main Navigation"
        >
          <NavLink to="/home" className={navPillClass}>
            Home
          </NavLink>

          <NavLink to="/sargam" className={navPillClass}>
            Sargam
          </NavLink>

          <NavLink to="/journeys" className={navPillClass}>
            Journey
          </NavLink>

          <NavLink to="/diary" className={navPillClass}>
            Diary
          </NavLink>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="theme-icon-button p-1.5 rounded-full transition-colors ml-0.5"
            title="Search music"
          >
            <Search size={14} />
          </button>
        </nav>

        {/* Right: Quick Search Input + Profile Menu */}
        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:flex items-center"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white backdrop-blur-xl transition-all focus-within:border-cyan-400 focus-within:bg-white/10">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search music..."
                className="moodiflo-search-input w-28 md:w-40 bg-transparent outline-none text-xs"
              />
              <button type="submit" className="theme-icon-button">
                <Search size={13} />
              </button>
            </div>
          </form>

          <button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* User Profile Avatar */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-gradient-to-tr from-indigo-600 to-pink-500 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {isProfileMenuOpen && (
                <div className="moodiflo-profile-menu absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b">
                    <p className="text-xs font-bold truncate">{user.name}</p>
                    <p className="text-[10px] moodiflo-muted truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}
                    className="moodiflo-menu-item w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-colors mt-1"
                  >
                    <UserIcon size={13} /> Profile
                  </button>
                  <button
                    onClick={() => { navigate('/favorites'); setIsProfileMenuOpen(false); }}
                    className="moodiflo-menu-item w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-colors"
                  >
                    <Heart size={13} /> Favorites
                  </button>
                  <button
                    onClick={() => { navigate('/playlists'); setIsProfileMenuOpen(false); }}
                    className="moodiflo-menu-item w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-colors"
                  >
                    <ListMusic size={13} /> Playlists
                  </button>
                  <button
                    onClick={() => { logout(); setIsProfileMenuOpen(false); navigate('/login'); }}
                    className="moodiflo-menu-item w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-colors mt-1 border-t"
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="moodiflo-sign-in flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors shadow-sm"
            >
              <UserIcon size={13} />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>

      {/* Instant Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="moodiflo-search-modal w-full max-w-xl rounded-3xl border p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2 flex-1">
                <Search size={16} className="text-cyan-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tracks, artists, or moods..."
                  className="moodiflo-search-input w-full bg-transparent text-sm outline-none"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="theme-icon-button p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
              {isSearching && (
                <div className="py-6 text-center text-xs text-slate-400">
                  Searching music across Spotify...
                </div>
              )}
              {!isSearching && searchResults.length > 0 && (
                searchResults.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => {
                      playSong(song, searchResults);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="h-11 w-11 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {song.coverImageUrl && (
                        <img src={song.coverImageUrl} alt={song.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                      <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-400/10">
                      {song.genre || song.language || 'Track'}
                    </span>
                  </div>
                ))
              )}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No tracks found for "{searchQuery}". Press Enter to browse discovery.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
