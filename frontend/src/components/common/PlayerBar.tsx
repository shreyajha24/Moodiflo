import React, { useState } from 'react';
import {
  BookHeart,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Compass,
  Languages,
  Music2,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';
import { useNavigate } from 'react-router-dom';

export const PlayerBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSong, isPlaying, currentTime, duration, progress, volume, isMuted,
    togglePlay, next, prev, seek, setVolume, toggleMute, retry, playbackStatus,
    toggleLyrics, isLyricsOpen, storyContext, activeMood,
  } = usePlayer();

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [showWhyInsight, setShowWhyInsight] = useState(false);

  if (!currentSong) return null;

  const time = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  };

  const contextLabel = storyContext || (activeMood ? `${activeMood} Sound` : 'Moodiflo Stream');

  return (
    <>
      {/* ── DESKTOP DOCKED BOTTOM BAR (md and up) ── */}
      <aside className="fixed bottom-0 left-0 right-0 z-30 hidden h-20 border-t border-white/10 bg-[#11182B]/95 px-6 shadow-2xl backdrop-blur-xl md:flex md:items-center md:justify-between">
        {/* Left: Track Details & Story Badge */}
        <div className="flex min-w-0 basis-1/4 items-center gap-3">
          <div className="artwork h-12 w-12 shrink-0 rounded-lg shadow-md">
            {currentSong.coverImageUrl ? (
              <img src={currentSong.coverImageUrl} alt={currentSong.title} />
            ) : (
              <div className="artwork-placeholder">
                <Music2 className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#EDEAF7]">{currentSong.title}</p>
            <p className="truncate text-xs text-[#A7ABC0]">{currentSong.artist}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D9B56D]">
                <Compass className="h-2.5 w-2.5" />
                {contextLabel}
              </span>
              {playbackStatus === 'error' && (
                <button onClick={retry} className="text-[10px] text-[#D97870] underline hover:text-white">
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="flex max-w-lg flex-1 flex-col items-center gap-1 px-4">
          <div className="flex items-center gap-4">
            <button
              aria-label="Previous track"
              onClick={prev}
              className="text-[#A7ABC0] transition-colors hover:text-white"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              aria-label={isPlaying ? 'Pause track' : 'Play track'}
              onClick={togglePlay}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#D9B56D] text-[#0B1020] shadow-md transition-transform hover:scale-105"
            >
              {playbackStatus === 'loading' ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1020]/30 border-t-[#0B1020]" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </button>
            <button
              aria-label="Next track"
              onClick={next}
              className="text-[#A7ABC0] transition-colors hover:text-white"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="flex w-full items-center gap-2.5 text-[11px] font-mono text-[#737B95]">
            <span className="w-8 text-right">{time(currentTime)}</span>
            <input
              aria-label="Track progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 min-w-0 flex-1 accent-[#D9B56D] cursor-pointer"
            />
            <span className="w-8">{time(duration)}</span>
          </div>
        </div>

        {/* Right: Actions, Lyrics, Volume */}
        <div className="flex min-w-0 basis-1/4 items-center justify-end gap-3 text-xs text-[#A7ABC0]">
          <button
            onClick={toggleLyrics}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
              isLyricsOpen ? 'bg-[#D9B56D]/15 text-[#D9B56D]' : 'hover:text-white'
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setShowWhyInsight(!showWhyInsight)}
            className="inline-flex items-center gap-1 hover:text-white"
            title="Why this song was recommended"
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => navigate('/diary')}
            className="inline-flex items-center gap-1 hover:text-[#D9B56D]"
            title="Save moment to diary"
          >
            <BookHeart className="h-3.5 w-3.5" />
          </button>

          <div className="ml-2 flex items-center gap-1.5 border-l border-white/10 pl-3">
            <button
              aria-label="Toggle mute"
              onClick={toggleMute}
              className="text-[#A7ABC0] hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 accent-[#D9B56D] cursor-pointer"
            />
          </div>
        </div>

        {/* Insight popover on desktop */}
        {showWhyInsight && (
          <div className="absolute right-24 bottom-24 w-72 rounded-2xl border border-white/10 bg-[#18223A] p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D9B56D]">Why this sound?</span>
              <button onClick={() => setShowWhyInsight(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#EDEAF7]">
              {currentSong.description || `Selected for ${currentSong.genre || 'contemporary'} resonance and mood alignment.`}
            </p>
            <p className="mt-2 text-[10px] text-[#8D86D9]">
              Language: {currentSong.language || 'Global'} · Genre: {currentSong.genre || 'Indie'}
            </p>
          </div>
        )}
      </aside>

      {/* ── MOBILE COMPACT MINI-PLAYER (Docked above bottom nav) ── */}
      <div
        className="fixed bottom-16 left-0 right-0 z-30 flex h-16 items-center justify-between border-t border-white/10 bg-[#11182B]/98 px-3 shadow-xl backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div
          onClick={() => setIsMobileExpanded(true)}
          className="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer"
        >
          <div className="artwork h-10 w-10 shrink-0 rounded-md shadow">
            {currentSong.coverImageUrl ? (
              <img src={currentSong.coverImageUrl} alt={currentSong.title} />
            ) : (
              <div className="artwork-placeholder">
                <Music2 className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#EDEAF7]">{currentSong.title}</p>
            <p className="truncate text-[10px] text-[#A7ABC0]">
              {currentSong.artist} · <span className="text-[#D9B56D]">{contextLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={togglePlay}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#D9B56D] text-[#0B1020]"
          >
            {playbackStatus === 'loading' ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0B1020]/30 border-t-[#0B1020]" />
            ) : isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
            )}
          </button>
          <button
            aria-label="Expand player"
            onClick={() => setIsMobileExpanded(true)}
            className="p-1.5 text-[#A7ABC0] hover:text-white"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>

        {/* Thin progress line on top edge of miniplayer */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
          <div className="h-full bg-[#D9B56D]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── MOBILE FULL-SCREEN BOTTOM SHEET ── */}
      {isMobileExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0B1020]/98 p-6 backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsMobileExpanded(false)}
              className="rounded-full p-2 text-[#A7ABC0] hover:text-white"
              aria-label="Minimize player"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D9B56D]">
                {contextLabel}
              </span>
              <p className="text-xs text-[#A7ABC0]">Now Playing</p>
            </div>
            <button
              onClick={toggleLyrics}
              className={`rounded-full p-2 transition-colors ${
                isLyricsOpen ? 'text-[#D9B56D]' : 'text-[#A7ABC0]'
              }`}
              aria-label="Toggle lyrics"
            >
              <Languages className="h-5 w-5" />
            </button>
          </div>

          {/* Big Artwork */}
          <div className="mx-auto my-auto w-full max-w-xs">
            <div className="artwork aspect-square w-full rounded-2xl shadow-2xl">
              {currentSong.coverImageUrl ? (
                <img src={currentSong.coverImageUrl} alt={currentSong.title} />
              ) : (
                <div className="artwork-placeholder">
                  <Music2 className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>

          {/* Details & Controls */}
          <div className="space-y-5 pb-6">
            <div>
              <h2 className="truncate text-xl font-bold text-white">{currentSong.title}</h2>
              <p className="mt-0.5 truncate text-sm text-[#A7ABC0]">{currentSong.artist}</p>
              {currentSong.genre && (
                <p className="mt-1 text-xs text-[#63B7AE]">
                  {currentSong.genre} · {currentSong.language || 'Global'}
                </p>
              )}
            </div>

            {/* Seek bar */}
            <div>
              <input
                aria-label="Seek track"
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="h-1.5 w-full accent-[#D9B56D] cursor-pointer"
              />
              <div className="mt-1.5 flex justify-between font-mono text-xs text-[#737B95]">
                <span>{time(currentTime)}</span>
                <span>{time(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-8 pt-2">
              <button
                aria-label="Previous"
                onClick={prev}
                className="p-2 text-[#A7ABC0] hover:text-white"
              >
                <SkipBack className="h-6 w-6" />
              </button>
              <button
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={togglePlay}
                className="grid h-14 w-14 place-items-center rounded-full bg-[#D9B56D] text-[#0B1020] shadow-xl transition-transform active:scale-95"
              >
                {playbackStatus === 'loading' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0B1020]/30 border-t-[#0B1020]" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="ml-1 h-6 w-6 fill-current" />
                )}
              </button>
              <button
                aria-label="Next"
                onClick={next}
                className="p-2 text-[#A7ABC0] hover:text-white"
              >
                <SkipForward className="h-6 w-6" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-around border-t border-white/10 pt-4 text-xs text-[#A7ABC0]">
              <button
                onClick={() => {
                  setIsMobileExpanded(false);
                  navigate('/journeys');
                }}
                className="inline-flex items-center gap-1.5 hover:text-[#D9B56D]"
              >
                <Plus className="h-4 w-4" />
                <span>To Journey</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileExpanded(false);
                  navigate('/diary');
                }}
                className="inline-flex items-center gap-1.5 hover:text-[#D9B56D]"
              >
                <BookHeart className="h-4 w-4" />
                <span>Save Memory</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
