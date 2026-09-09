import React from 'react';
import { NavLink } from 'react-router-dom';
import { AudioWaveform, Globe2, Route, BookHeart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const MobileNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `mobile-dock-link ${isActive ? 'is-active' : ''}`;

  return (
    <nav className="mobile-dock" aria-label="Mobile navigation">
      <NavLink to={isAuthenticated ? '/home' : '/'} className={navItemClass}>
        <AudioWaveform className="h-5 w-5" strokeWidth={1.75} />
        Home
      </NavLink>

      <NavLink to="/sargam" className={navItemClass}>
        <Globe2 className="h-5 w-5" strokeWidth={1.75} />
        Sargam
      </NavLink>

      <NavLink to="/journeys" className={navItemClass}>
        <Route className="h-5 w-5" strokeWidth={1.75} />
        Journey
      </NavLink>

      <NavLink to="/diary" className={navItemClass}>
        <BookHeart className="h-5 w-5" strokeWidth={1.75} />
        Diary
      </NavLink>
    </nav>
  );
};
