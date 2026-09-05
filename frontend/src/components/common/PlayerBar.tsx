import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, FileText, Music, Sparkles } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    activeMood,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleLyrics,
    isLyricsOpen,
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d18]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Song Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="relative w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10 shadow-md">
            {currentSong.coverImageUrl ? (
              <img
                src={currentSong.coverImageUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-violet-400">
                <Music className="w-5 h-5" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-violet-600/20 backdrop-blur-[1px] flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-violet-400 animate-pulse" />
                  <span className="w-0.5 h-2/3 bg-violet-400 animate-pulse delay-75" />
                  <span className="w-0.5 h-full bg-violet-400 animate-pulse delay-150" />
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-sm font-semibold text-white truncate">{currentSong.title}</h5>
            <p className="text-xs text-slate-400 truncate">{currentSong.artist}</p>
          </div>
          {activeMood && (
            <span className="hidden lg:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              {activeMood}
            </span>
          )}
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4 max-w-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={prev}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:scale-105 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="flex items-center gap-2.5 w-full text-[11px] font-mono text-slate-400">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = (clickX / rect.width) * 100;
                seek(percentage);
              }}
              className="relative flex-1 h-1.5 bg-slate-800 hover:h-2 rounded-full cursor-pointer overflow-hidden transition-all group"
            >
              <div
                style={{ width: `${progress}%` }}
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full group-hover:from-violet-400 group-hover:to-cyan-300 transition-all"
              />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Lyrics */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <button
            onClick={toggleLyrics}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isLyricsOpen
                ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Lyrics & Translation"
          >
            <FileText className="w-3.5 h-3.5" />
            Lyrics
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-slate-800 accent-violet-500 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
