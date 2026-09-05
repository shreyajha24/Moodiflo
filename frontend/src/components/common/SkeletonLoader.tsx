import React from 'react';

export const SongCardSkeleton: React.FC = () => (
  <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 animate-pulse">
    <div className="w-full aspect-square bg-slate-800/60 rounded-xl" />
    <div className="h-4 bg-slate-800/60 rounded w-3/4" />
    <div className="h-3 bg-slate-800/40 rounded w-1/2" />
  </div>
);

export const SongRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-slate-800/60 rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-800/60 rounded w-32" />
        <div className="h-3 bg-slate-800/40 rounded w-24" />
      </div>
    </div>
    <div className="h-3 bg-slate-800/40 rounded w-12" />
  </div>
);

export const MoodCardSkeleton: React.FC = () => (
  <div className="glass-panel p-6 rounded-2xl h-44 flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 bg-slate-800/60 rounded-full" />
      <div className="w-16 h-5 bg-slate-800/40 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-slate-800/60 rounded w-1/2" />
      <div className="h-3 bg-slate-800/40 rounded w-3/4" />
    </div>
  </div>
);
