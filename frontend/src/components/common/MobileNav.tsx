import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, Search, Heart, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const MobileNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-semibold transition-colors ${
      isActive ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 py-1">
      <NavLink to={isAuthenticated ? '/home' : '/'} className={navItemClass}>
        <Home className="w-5 h-5" />
        Home
      </NavLink>

      <NavLink to="/moods" className={navItemClass}>
        <Sparkles className="w-5 h-5" />
        Moods
      </NavLink>

      <NavLink to="/search" className={navItemClass}>
        <Search className="w-5 h-5" />
        Search
      </NavLink>

      <NavLink to="/favorites" className={navItemClass}>
        <Heart className="w-5 h-5" />
        Favorites
      </NavLink>

      <NavLink to={isAuthenticated ? '/profile' : '/login'} className={navItemClass}>
        <User className="w-5 h-5" />
        {isAuthenticated ? 'Profile' : 'Log In'}
      </NavLink>
    </nav>
  );
};
