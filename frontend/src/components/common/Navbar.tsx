import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Search, Sparkles, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#090a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between gap-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search songs, artists, or moods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/10 transition-all"
        />
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Mood Discovery CTA */}
        <NavLink
          to="/moods"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:bg-violet-600/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Mood Discovery
        </NavLink>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <NavLink
              to="/profile"
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-violet-500/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline text-xs font-medium text-slate-200">
                {user.name}
              </span>
            </NavLink>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </NavLink>
            <NavLink
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
};
