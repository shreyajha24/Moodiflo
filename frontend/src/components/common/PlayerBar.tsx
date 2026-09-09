import React, { useState } from 'react';
import {
  BookHeart,
  Languages,
  Music2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ExternalLink,
} from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';
import { AddMemoryModal } from './AddMemoryModal';

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    retry,
    playbackStatus,
    toggleLyrics,
    isLyricsOpen,
    activeMood,
  } = usePlayer();

  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const songTitle = currentSong.title;
  const songArtist = currentSong.artist;
  const moodLabel = activeMood ? activeMood.charAt(0) + activeMood.slice(1).toLowerCase() : 'Now playing';

  return (
    <>
      <aside
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-4xl rounded-2xl border border-white/15 px-4 py-2.5 shadow-2xl backdrop-blur-2xl transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 18, 36, 0.88) 0%, rgba(8, 11, 24, 0.94) 100%)',
          boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.7), 0 0 24px rgba(34, 211, 238, 0.1)',
        }}
        aria-label="Universal playback dock"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          {/* Left: Song Info & Mood Pill */}
          <div className="flex items-center gap-3 min-w-0 md:basis-[28%]">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-inner">
              {currentSong?.coverImageUrl ? (
                <img
                  src={currentSong.coverImageUrl}
                  alt={songTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-cyan-400">
                  <Music2 size={16} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white tracking-wide">
                {songTitle}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {songArtist}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-medium text-cyan-400 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Mood: {moodLabel}
                </span>
                {playbackStatus === 'error' && (
                  <span className="flex items-center gap-2 ml-1">
                    <button onClick={retry} className="text-[10px] text-pink-400 underline">Retry</button>
                    {currentSong.spotifyExternalUrl && (
                      <a
                        href={currentSong.spotifyExternalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-cyan-300 underline"
                      >
                        Open in Spotify <ExternalLink size={10} />
                      </a>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Controls & Progress */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-md mx-auto">
            {/* Control buttons matching reference bottom bar: Repeat, Shuffle, Prev, Play, Next, Volume, Share */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isRepeat ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Repeat"
              >
                <Repeat size={14} />
              </button>

              <button
                type="button"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isShuffle ? 'text-purple-400 bg-purple-400/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={14} />
              </button>

              <button
                type="button"
                onClick={prev}
                className="p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Previous track"
              >
                <SkipBack size={16} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/20 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {playbackStatus === 'loading' ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : isPlaying ? (
                  <Pause size={15} className="fill-current" />
                ) : (
                  <Play size={15} className="fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={next}
                className="p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Next track"
              >
                <SkipForward size={16} />
              </button>

              {/* Volume Button with Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVolumePopup(!showVolumePopup)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Volume"
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {showVolumePopup && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 rounded-xl border border-white/15 bg-[#0e1224] shadow-xl backdrop-blur-xl flex flex-col items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="h-20 w-1.5 accent-cyan-400 -rotate-90 cursor-pointer my-8"
                    />
                    <button
                      onClick={toggleMute}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Track */}
            <div className="flex w-full items-center gap-2 text-[10.5px] font-mono text-slate-400">
              <span className="w-8 text-right">{formatTime(currentTime)}</span>
              <div className="relative flex-1 flex items-center h-4 cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress || 0}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
              <span className="w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Translation feature & Diary Add */}
          <div className="flex items-center justify-end gap-2 md:basis-[28%]">
            {/* Translation & Lyrics Feature Button */}
            <button
              type="button"
              onClick={toggleLyrics}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                isLyricsOpen
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-md shadow-cyan-400/20'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/30'
              }`}
              title="Lyrics & Realtime Translation"
            >
              <Languages size={14} className="text-cyan-400" />
              <span>Translate</span>
            </button>

            {/* Save to Diary Feature Button */}
            <button
              type="button"
              onClick={() => setIsMemoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-pink-500/15 hover:border-pink-500/40 text-slate-200 hover:text-pink-300 transition-all text-xs font-semibold"
              title="Add to Diary Archive"
            >
              <BookHeart size={14} className="text-pink-400" />
              <span className="hidden sm:inline">Add Diary</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Memory Add Modal */}
      <AddMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />
    </>
  );
};
