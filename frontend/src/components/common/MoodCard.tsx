import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Waves } from 'lucide-react';
import type { MoodView } from '../../types';
import { getMoodTheme, isLowMood } from '../../utils/moodTheme';

interface MoodCardProps {
  mood: MoodView;
}

export const MoodCard: React.FC<MoodCardProps> = ({ mood }) => {
  const navigate = useNavigate();
  const theme = getMoodTheme(mood.name);
  const isQuiet = isLowMood(mood.name);

  return (
    <div
      onClick={() => navigate(`/moods/${encodeURIComponent(mood.name)}`)}
      className={`group relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 border cursor-pointer overflow-hidden ${
        isQuiet
          ? 'h-44 bg-white/[0.02] hover:bg-white/[0.05] border-white/10 hover:border-slate-500'
          : `h-52 bg-gradient-to-br ${theme.cardClasses} hover:scale-[1.02] shadow-xl shadow-black/40`
      }`}
    >
      {/* Ambient background blur */}
      <div
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ background: theme.primaryColor }}
      />

      {/* Top row: Emoji & Category Pill */}
      <div className="flex items-start justify-between z-10">
        <span className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          {theme.emoji || mood.emoji}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${theme.badgeClasses}`}>
          {isQuiet ? 'Reflective' : 'Active Wave'}
        </span>
      </div>

      {/* Bottom Information */}
      <div className="z-10 mt-auto space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white font-display">
            {theme.displayName}
          </h3>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {mood.description || theme.vibeTagline}
        </p>

        {/* Recommended Genres or Shift Prompt */}
        {isQuiet ? (
          <p className="text-[11px] font-semibold text-cyan-300/90 pt-1 flex items-center gap-1">
            <Waves className="w-3 h-3" /> Tap to shift vibe
          </p>
        ) : mood.recommendedGenres && mood.recommendedGenres.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-2">
            {mood.recommendedGenres.slice(0, 2).map((genre, i) => (
              <span
                key={i}
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
