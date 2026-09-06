import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Languages, Music2 } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';
import { getMoodTheme } from '../../utils/moodTheme';

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

  const currentTheme = getMoodTheme(activeMood || currentSong.genre || 'HAPPY');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-14 md:bottom-5 left-2 right-2 sm:left-6 sm:right-6 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-40 transition-all duration-300">
      <div
        className="rounded-2xl sm:rounded-3xl bg-[#131520]/95 backdrop-blur-2xl border border-white/10 p-2.5 sm:px-4 sm:py-3 shadow-2xl transition-all"
        style={{
          boxShadow: `0 20px 40px -15px ${currentTheme.primaryColor}25, 0 0 1px 1px rgba(255,255,255,0.08)`,
        }}
      >
        {/* Contextual Mood Vibe Bar */}
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-white/[0.06] text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <span className="text-xs">{currentTheme.emoji}</span>
              <span className="text-slate-400">Flowing in:</span>
              <span className="text-white capitalize">{currentTheme.displayName}</span>
            </span>
            {isPlaying && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Active Flow
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[10px]">
            <span className="hidden sm:inline">Music that moves with you</span>
            <button
              onClick={toggleLyrics}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                isLyricsOpen
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isLyricsOpen ? 'Close Lyrics' : 'Lyrics & Translate'}</span>
            </button>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-1/3 sm:w-1/4 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-800 overflow-hidden shrink-0 border border-white/10">
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
                <div className="w-full h-full flex items-center justify-center text-amber-400">
                  <Music2 className="w-5 h-5" />
                </div>
              )}

              {/* Dynamic waveform badge */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-0.5">
                  <span className="w-1 bg-amber-400 rounded-full wave-bar-1" />
                  <span className="w-1 bg-rose-400 rounded-full wave-bar-2" />
                  <span className="w-1 bg-cyan-400 rounded-full wave-bar-3" />
                  <span className="w-1 bg-amber-300 rounded-full wave-bar-4" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate">{currentSong.title}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Transport & Scrubber */}
          <div className="flex-1 max-w-md flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={prev}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 hover:scale-105 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/25 transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={next}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Scrubber Bar */}
            <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="w-7 text-right shrink-0">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-1.5 bg-white/10 hover:h-2 rounded-full overflow-hidden cursor-pointer relative transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  seek(pct);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="w-7 text-left shrink-0">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center justify-end gap-2 w-1/4">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-white/10 accent-amber-400 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
