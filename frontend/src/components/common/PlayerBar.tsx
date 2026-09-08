import React from 'react';
import { BookHeart, CircleHelp, Languages, Music2, Pause, Play, Plus, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';

export const PlayerBar: React.FC = () => {
  const {
    currentSong, isPlaying, currentTime, duration, progress, volume, isMuted,
    togglePlay, next, prev, seek, setVolume, toggleMute, retry, playbackStatus, playbackError,
    toggleLyrics, isLyricsOpen,
  } = usePlayer();

  if (!currentSong) return null;
  const time = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <aside className="fixed inset-x-3 bottom-[4.5rem] z-40 mx-auto max-w-5xl md:inset-x-6 md:bottom-5">
      <div className="border border-white/10 bg-[#11182B]/96 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl md:p-4" style={{ borderRadius: '1.15rem' }}>
        {playbackError && <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#D97870]/25 pb-2 text-xs text-[#e8aaa3]"><span>{playbackError}</span><button onClick={retry} className="button-quiet min-h-8 px-3 text-xs">Retry</button></div>}
        <div className="flex items-center gap-3">
          <div className="artwork h-11 w-11 shrink-0 rounded-lg md:h-14 md:w-14">
            {currentSong.coverImageUrl ? <img src={currentSong.coverImageUrl} alt={currentSong.title} /> : <div className="artwork-placeholder"><Music2 className="h-5 w-5" /></div>}
          </div>
          <div className="min-w-0 w-[38%] md:w-1/4">
            <p className="truncate text-sm font-semibold text-[#EDEAF7]">{currentSong.title}</p>
            <p className="truncate text-xs text-[#A7ABC0]">{currentSong.artist}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[#737B95]">{playbackStatus === 'loading' ? 'Loading' : playbackStatus === 'error' ? 'Unable to play' : isPlaying ? 'Playing' : 'Paused'}</p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <button aria-label="Previous track" onClick={prev} className="text-[#A7ABC0] hover:text-white"><SkipBack className="h-4 w-4" /></button>
              <button aria-label={isPlaying ? 'Pause track' : 'Play track'} onClick={togglePlay} className="grid h-10 w-10 place-items-center rounded-full bg-[#D9B56D] text-[#0B1020]">
                {playbackStatus === 'loading' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1020]/30 border-t-[#0B1020]" /> : isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
              </button>
              <button aria-label="Next track" onClick={next} className="text-[#A7ABC0] hover:text-white"><SkipForward className="h-4 w-4" /></button>
            </div>
            <div className="flex w-full items-center gap-2 text-[10px] text-[#737B95]">
              <span>{time(currentTime)}</span>
              <input aria-label="Track progress" type="range" min="0" max="100" value={progress} onChange={(event) => seek(Number(event.target.value))} className="h-1 min-w-0 flex-1 accent-[#D9B56D]" />
              <span>{time(duration)}</span>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button aria-label="Toggle mute" onClick={toggleMute} className="text-[#A7ABC0] hover:text-white">{isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
            <input aria-label="Volume" type="range" min="0" max="1" step="0.02" value={isMuted ? 0 : volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-20 accent-[#D9B56D]" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-3 border-t border-white/[0.06] pt-2 text-[10px] text-[#A7ABC0]">
          <button onClick={toggleLyrics} className="inline-flex items-center gap-1 hover:text-white"><Languages className="h-3.5 w-3.5" /> {isLyricsOpen ? 'Close lyrics' : 'Lyrics'}</button>
          <button className="inline-flex items-center gap-1 hover:text-white"><CircleHelp className="h-3.5 w-3.5" /> Why this?</button>
          <button className="hidden items-center gap-1 hover:text-white sm:inline-flex"><BookHeart className="h-3.5 w-3.5" /> Save memory</button>
          <button className="hidden items-center gap-1 hover:text-white sm:inline-flex"><Plus className="h-3.5 w-3.5" /> Add to journey</button>
        </div>
      </div>
    </aside>
  );
};
