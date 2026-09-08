import React from 'react';
import { NavLink } from 'react-router-dom';
import { Waves, Compass, Globe2, Route, BookHeart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const MobileNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
    isActive ? 'text-[#D9B56D]' : 'text-[#737B95] hover:text-[#EDEAF7]'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#0B1020]/96 px-1 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl backdrop-blur-xl md:hidden">
      <NavLink to={isAuthenticated ? '/home' : '/'} className={navItemClass}>
        <Waves className="w-4 h-4" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/discover" className={navItemClass}>
        <Compass className="w-4 h-4" />
        <span>Discover</span>
      </NavLink>

      <NavLink to="/sargam" className={navItemClass}>
        <Globe2 className="w-4 h-4" />
        <span>Sargam</span>
      </NavLink>

      <NavLink to="/journeys" className={navItemClass}>
        <Route className="w-4 h-4" />
        <span>Journey</span>
      </NavLink>

      <NavLink to="/diary" className={navItemClass}>
        <BookHeart className="w-4 h-4" />
        <span>Diary</span>
      </NavLink>
    </nav>
  );
};
