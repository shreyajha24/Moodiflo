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

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-xs font-semibold tracking-wide transition-colors ${
      isActive
        ? 'border-b border-[#D9B56D] text-white'
        : 'text-[#A7ABC0] hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B1020]/95 px-4 py-3.5 backdrop-blur-xl transition-all sm:px-6">
      <div className="site-container flex items-center justify-between gap-3">
        {/* Brand Wordmark */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D9B56D]/60 bg-[#D9B56D]/10 text-[#D9B56D] transition-transform group-hover:scale-105">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8D86D9]/40">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center text-lg font-semibold tracking-tight text-white font-display">
              Mood<span className="font-semibold text-[#D9B56D]">iflo</span>
            </span>
            <span className="text-[10px] text-[#A7ABC0] font-medium -mt-1 tracking-wider">
              Music in motion
            </span>
          </div>
        </NavLink>

        {/* Minimal Navigation Pills - Desktop */}
        <nav className="hidden items-center gap-1 border-x border-white/10 px-3 md:flex">
          <NavLink to={isAuthenticated ? '/home' : '/'} className={navItemClass}>
            Home
          </NavLink>
          <NavLink to="/discover" className={navItemClass}>
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#8D86D9]" />
              Discover
            </span>
          </NavLink>
          <NavLink to="/sargam" className={navItemClass}>
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-[#63B7AE]" />
              Sargam
            </span>
          </NavLink>
          <NavLink to="/journeys" className={navItemClass}>
            <span className="flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-[#8D86D9]" />
              Journey
            </span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/diary" className={navItemClass}>
              <span className="flex items-center gap-1.5">
                <BookHeart className="w-3.5 h-3.5 text-[#D9B56D]" />
                Diary
              </span>
            </NavLink>
          )}
        </nav>

        {/* Right Section: Active Vibe Badge & Profile */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D9B56D]/60 bg-[#D9B56D]/15 text-[10px] font-bold text-[#D9B56D]">
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
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[#D97870] hover:bg-[#D97870]/10"
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
              className="button-primary px-4 text-xs"
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
