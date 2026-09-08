import React from 'react';
import { Waves, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-white/[0.06] pt-12 pb-16 px-4 text-xs text-slate-500">
      <div className="site-container flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Waves className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 tracking-tight text-sm">
              Mood<span className="mood-wave">iflo</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium">Music that responds to your mood</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-md">
            Music for where you are — and where you want to go. Acknowledge, shift the vibe, and find your sound.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <NavLink to="/moods" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Shift Your Mood
          </NavLink>
          <NavLink to="/songs" className="hover:text-slate-200 transition-colors">
            Sound Vault
          </NavLink>
          <NavLink to="/search" className="hover:text-slate-200 transition-colors">
            Search
          </NavLink>
        </div>
      </div>
    </footer>
  );
};
