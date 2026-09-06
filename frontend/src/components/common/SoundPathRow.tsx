import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, Music2 } from 'lucide-react';
import type { SongView } from '../../types';
import { usePlayer } from '../../hooks/usePlayer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { favoriteService } from '../../services/favoriteService';

interface SoundPathRowProps {
  index: number;
  song: SongView;
  playlistContext?: SongView[];
  onAddToPlaylist?: (song: SongView) => void;
  activeMood?: string;
}

export const SoundPathRow: React.FC<SoundPathRowProps> = ({
  index,
  song,
  playlistContext,
  onAddToPlaylist,
  activeMood,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const isThisSongPlaying = currentSong?.id === song.id && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, playlistContext || [song], activeMood);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      info('Please sign in to favorite tracks');
      return;
    }
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(song.id);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(song.id);
        setIsFavorite(true);
        success(`Saved to favorites`);
      }
    } catch {
      // ignore
    }
  };

  const formatDuration = (secs?: number | null) => {
    if (!secs) return '3:15';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
        isThisSongPlaying
          ? 'bg-white/10 border border-white/15 text-white'
          : 'bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-300'
      }`}
    >
      {/* Index & Cover */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="w-5 text-center font-mono text-xs text-slate-500 group-hover:text-amber-400 shrink-0">
          {isThisSongPlaying ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
          ) : (
            (index + 1).toString().padStart(2, '0')
          )}
        </span>

        <div className="relative w-11 h-11 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10 shadow-sm">
          {song.coverImageUrl ? (
            <img
              src={song.coverImageUrl}
              alt={song.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Music2 className="w-4 h-4" />
            </div>
          )}

          {/* Hover Play button */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {isThisSongPlaying ? (
              <Pause className="w-4 h-4 fill-white text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xs sm:text-sm font-bold truncate ${isThisSongPlaying ? 'text-amber-300' : 'text-white'}`}>
            {song.title}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {song.artist}
            {song.genre && <span className="text-slate-500"> • {song.genre}</span>}
          </p>
        </div>
      </div>

      {/* Duration & Quick Actions */}
      <div className="flex items-center gap-2 text-xs shrink-0">
        <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
          {formatDuration(song.duration)}
        </span>

        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            isFavorite ? 'text-rose-400' : 'text-slate-500 hover:text-white'
          }`}
          title="Favorite"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {onAddToPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(song);
            }}
            className="p-1.5 rounded-full text-slate-500 hover:text-white transition-colors cursor-pointer"
            title="Add to playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
