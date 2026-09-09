import React from 'react';
import { Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import moodifloLogo from '../../assets/moodiflo-logo.svg';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t pt-10 pb-12 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
      <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <img src={moodifloLogo} alt="" className="h-6 w-7 object-contain" />
            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Moodiflo</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: 'var(--text-secondary)' }}>Feel the shift</span>
          </div>
          <p className="max-w-md text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Futuristic mood-driven discovery — Sargam, Journey, Diary, and music that moves with you.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 font-medium" style={{ color: 'var(--text-secondary)' }}>
          <NavLink to="/home" className="inline-flex items-center gap-1 transition-colors hover:opacity-100" style={{ color: 'inherit' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent-magenta)' }} strokeWidth={1.75} />
            Mood shifter
          </NavLink>
          <NavLink to="/search" className="transition-colors" style={{ color: 'inherit' }}>Search</NavLink>
          <NavLink to="/sargam" className="transition-colors" style={{ color: 'inherit' }}>Sargam</NavLink>
        </div>
      </div>
    </footer>
  );
};
