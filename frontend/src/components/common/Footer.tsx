import React from 'react';
import { Disc3, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/5 py-10 px-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Disc3 className="w-4 h-4 text-violet-500" />
          <span className="font-bold text-slate-300">Moodify</span>
          <span>• Mood-Driven Music Streaming & Discovery</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          <span>for music lovers everywhere</span>
        </div>
      </div>
    </footer>
  );
};
