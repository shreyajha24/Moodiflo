import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import type { MoodView } from '../../types';

interface MoodCardProps {
  mood: MoodView;
}

// Helper to determine color scheme per mood
const getMoodGradient = (name: string) => {
  const n = name.toUpperCase();
  if (n.includes('HAPPY') || n.includes('JOY')) {
    return 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 group-hover:border-amber-400/60 text-amber-300';
  }
  if (n.includes('ENERGETIC') || n.includes('WORKOUT') || n.includes('PARTY')) {
    return 'from-rose-500/20 via-orange-500/10 to-transparent border-rose-500/30 group-hover:border-rose-400/60 text-rose-300';
  }
  if (n.includes('CALM') || n.includes('RELAX') || n.includes('PEACE') || n.includes('ZEN')) {
    return 'from-teal-500/20 via-emerald-500/10 to-transparent border-teal-500/30 group-hover:border-teal-400/60 text-teal-300';
  }
  if (n.includes('ROMANTIC') || n.includes('LOVE')) {
    return 'from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30 group-hover:border-pink-400/60 text-pink-300';
  }
  if (n.includes('SAD') || n.includes('MELANCHOLY') || n.includes('BLUE')) {
    return 'from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/30 group-hover:border-blue-400/60 text-blue-300';
  }
  if (n.includes('FOCUS') || n.includes('STUDY') || n.includes('WORK')) {
    return 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30 group-hover:border-cyan-400/60 text-cyan-300';
  }
  return 'from-violet-500/20 via-indigo-500/10 to-transparent border-violet-500/30 group-hover:border-violet-400/60 text-violet-300';
};

export const MoodCard: React.FC<MoodCardProps> = ({ mood }) => {
  const navigate = useNavigate();
  const gradientStyles = getMoodGradient(mood.name);
  const intensityPct = Math.round(mood.intensity * 100);

  return (
    <div
      onClick={() => navigate(`/moods/${encodeURIComponent(mood.name)}`)}
      className={`group relative rounded-3xl p-6 flex flex-col justify-between h-48 cursor-pointer overflow-hidden transition-all duration-300 glass-panel glass-panel-hover border bg-gradient-to-br ${gradientStyles}`}
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-all pointer-events-none" />

      {/* Top row: Emoji & Intensity */}
      <div className="flex items-start justify-between z-10">
        <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          {mood.emoji || '✨'}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold">
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>{intensityPct}%</span>
        </div>
      </div>

      {/* Bottom info */}
      <div className="z-10 mt-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold text-white group-hover:text-violet-200 transition-colors">
            {mood.name}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {mood.description}
        </p>

        {/* Genres */}
        {mood.recommendedGenres && mood.recommendedGenres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {mood.recommendedGenres.slice(0, 3).map((genre, i) => (
              <span
                key={i}
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
