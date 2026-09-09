import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Home,
  Search,
  Heart,
  ListMusic,
  History,
  Music4,
  Disc3,
  PlusCircle,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { playlistService } from '../../services/playlistService';
import type { PlaylistView } from '../../types';

export const Sidebar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [quickPlaylists, setQuickPlaylists] = useState<PlaylistView[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      playlistService
        .getAllPlaylists()
        .then((data) => setQuickPlaylists(data.slice(0, 5)))
        .catch(() => {});
    } else {
      setQuickPlaylists([]);
    }
  }, [isAuthenticated]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/10 border border-violet-500/30 text-white font-semibold shadow-lg shadow-violet-600/10'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-[#07080d] border-r border-white/10 p-5 shrink-0 select-none overflow-y-auto">
      {/* Brand Logo */}
      <NavLink to="/" className="flex items-center gap-3 px-2 py-3 mb-6 group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
          <Disc3 className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
            Mood<span className="mood-wave">iflo</span>
            <Sparkles className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          </h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Vibe & Flow Music</p>
        </div>
      </NavLink>

      {/* Main Navigation */}
      <div className="space-y-6 flex-1">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Discover</p>
          <nav className="space-y-1">
            {isAuthenticated && (
              <NavLink to="/home" className={navLinkClass}>
                <Home className="w-4 h-4 text-violet-400" />
                Home
              </NavLink>
            )}
            <NavLink to="/moods" className={navLinkClass}>
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Mood Explorer
            </NavLink>
            <NavLink to="/songs" className={navLinkClass}>
              <Music4 className="w-4 h-4 text-cyan-400" />
              All Songs
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              <Search className="w-4 h-4 text-pink-400" />
              Search
            </NavLink>
          </nav>
        </div>

        {/* Library Section (for logged-in users) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">My Music</p>
          <nav className="space-y-1">
            <NavLink to="/favorites" className={navLinkClass}>
              <Heart className="w-4 h-4 text-rose-400" />
              Favorites
            </NavLink>
            <NavLink to="/playlists" className={navLinkClass}>
              <ListMusic className="w-4 h-4 text-emerald-400" />
              Playlists
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
              <History className="w-4 h-4 text-blue-400" />
              Listening History
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/profile" className={navLinkClass}>
                <User className="w-4 h-4 text-indigo-400" />
                Profile
              </NavLink>
            )}
          </nav>
        </div>

        {/* Quick Playlists */}
        {isAuthenticated && quickPlaylists.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Playlists</p>
              <NavLink to="/playlists" className="text-slate-400 hover:text-white text-xs">
                <PlusCircle className="w-3.5 h-3.5" />
              </NavLink>
            </div>
            <div className="space-y-0.5">
              {quickPlaylists.map((pl) => (
                <NavLink
                  key={pl.id}
                  to={`/playlists/${pl.id}`}
                  className="block px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 truncate transition-colors"
                >
                  {pl.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User profile card at bottom of sidebar */}
      {isAuthenticated && user && (
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <NavLink to="/profile" className="flex items-center gap-3 group truncate">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-200 font-bold flex items-center justify-center text-sm shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </NavLink>
        </div>
      )}
    </aside>
  );
};
