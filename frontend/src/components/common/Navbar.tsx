import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Search,
  LogIn,
  User as UserIcon,
  LogOut,
  Waves,
  Heart,
  ListMusic,
  Compass,
  Globe2,
  BookHeart,
  Route,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePlayer } from '../../hooks/usePlayer';
import { getMoodTheme } from '../../utils/moodTheme';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { activeMood } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentTheme = getMoodTheme(activeMood || 'HAPPY');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
      isActive
        ? 'bg-white/15 text-white shadow-sm border border-white/15'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0c10]/80 border-b border-white/5 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 p-[1.5px] shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d0e14] rounded-[14px] flex items-center justify-center text-white">
              <Waves className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center">
              Mood<span className="mood-wave font-bold">iflo</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider">
            Music with a memory
            </span>
          </div>
        </NavLink>

        {/* Minimal Navigation Pills - Desktop */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <NavLink to={isAuthenticated ? '/home' : '/'} className={navItemClass}>
            Home
          </NavLink>
          <NavLink to="/discover" className={navItemClass}>
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#9B8AFB]" />
              Discover
            </span>
          </NavLink>
          <NavLink to="/journeys" className={navItemClass}>
            <Route className="mr-1 inline h-3.5 w-3.5 text-[#FF7A73]" /> Journeys
          </NavLink>
          <NavLink to="/world" className={navItemClass}>
            <Globe2 className="mr-1 inline h-3.5 w-3.5 text-[#70D6D0]" /> World
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/diary" className={navItemClass}>
              <BookHeart className="mr-1 inline h-3.5 w-3.5 text-[#F5C76A]" /> Diary
            </NavLink>
          )}
        </nav>

        {/* Right Section: Active Vibe Badge & Profile */}
        <div className="flex items-center gap-3">
          {/* Active Mood Pill */}
          <button
            onClick={() => navigate('/moods')}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${currentTheme.badgeClasses} hover:scale-105`}
            title="Click to shift your mood vibe"
          >
            <span className="text-sm">{currentTheme.emoji}</span>
            <span className="capitalize">{activeMood ? `${currentTheme.displayName} Wave` : 'Find Your Vibe'}</span>
          </button>

          {/* Search Trigger (Mobile / Quick) */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-48 focus-within:w-64 transition-all">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search soundscape..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.08] transition-all"
            />
          </form>

          {/* User Profile / Authentication */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-white transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-[10px] font-bold text-slate-900">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate font-medium">{user.name.split(' ')[0]}</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#141622] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Profile & Stats
                  </button>

                  <button
                    onClick={() => {
                      navigate('/favorites');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    Favorites
                  </button>

                  <button
                    onClick={() => {
                      navigate('/playlists');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <ListMusic className="w-3.5 h-3.5 text-violet-400" />
                    Playlists
                  </button>

                  <div className="my-1 border-t border-white/5" />

                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
