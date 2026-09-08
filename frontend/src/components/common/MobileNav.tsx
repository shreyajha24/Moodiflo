import React from 'react';
import { NavLink } from 'react-router-dom';
import { Waves, Compass, Route, BookHeart, Library } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const MobileNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-semibold transition-all ${
      isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0d0e14]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-2 py-1 shadow-2xl">
      <NavLink to={isAuthenticated ? '/home' : '/'} className={navItemClass}>
        <Waves className="w-5 h-5" />
        Home
      </NavLink>

      <NavLink to="/discover" className={navItemClass}>
        <Compass className="w-5 h-5" />
        Discover
      </NavLink>

      <NavLink to="/journeys" className={navItemClass}>
        <Route className="w-5 h-5" />
        Journeys
      </NavLink>

      <NavLink to="/diary" className={navItemClass}>
        <BookHeart className="w-5 h-5" />
        Diary
      </NavLink>

      <NavLink to="/songs" className={navItemClass}>
        <Library className="w-5 h-5" />
        Library
      </NavLink>
    </nav>
  );
};
