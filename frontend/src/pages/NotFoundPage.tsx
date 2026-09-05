import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto animate-pulse">
          <Compass className="w-12 h-12" />
        </div>
        <div className="absolute -inset-4 bg-violet-500/10 rounded-full blur-2xl -z-10" />
      </div>

      <span className="text-6xl sm:text-8xl font-black gradient-text tracking-tight mb-2">
        404
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        Lost in the Soundscape?
      </h1>
      <p className="text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
        The page or playlist you are looking for has faded into the mist or does not exist. Let's get you back into the right rhythm.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
        <button
          onClick={() => navigate('/moods')}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          Explore Moods
        </button>
      </div>
    </div>
  );
};
