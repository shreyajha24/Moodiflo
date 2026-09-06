import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Plus, Music2 } from 'lucide-react';
import type { SongView } from '../../types';
import { usePlayer } from '../../hooks/usePlayer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { favoriteService } from '../../services/favoriteService';

interface SongCardProps {
  song: SongView;
  playlistContext?: SongView[];
  isFavorite?: boolean;
  onFavoriteChange?: (songId: number, isFav: boolean) => void;
  onAddToPlaylist?: (song: SongView) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  playlistContext,
  isFavorite = false,
  onFavoriteChange,
  onAddToPlaylist,
}) => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const [favorite, setFavorite] = useState(isFavorite);
  const [favLoading, setFavLoading] = useState(false);

  const isThisSongPlaying = currentSong?.id === song.id && isPlaying;
  const isSpotifyTrack = Boolean(song.spotifyTrackId || song.spotifyUri);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, playlistContext || [song]);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      info('Please log in to save favorites');
      navigate('/login');
      return;
    }

    setFavLoading(true);
    try {
      if (favorite) {
        await favoriteService.removeFavorite(song.id);
        setFavorite(false);
        onFavoriteChange?.(song.id, false);
        success(`Removed "${song.title}" from favorites`);
      } else {
        await favoriteService.addFavorite(song.id);
        setFavorite(true);
        onFavoriteChange?.(song.id, true);
        success(`Added "${song.title}" to favorites`);
      }
    } catch {
      error('Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={() => navigate(`/songs/${song.id}`)}
      className="group relative glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between cursor-pointer overflow-hidden transition-all duration-300 border border-white/5 hover:border-violet-500/30"
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-violet-950/50 flex items-center justify-center shadow-lg">
        {song.coverImageUrl ? (
          <img
            src={song.coverImageUrl}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // fallback if URL broken
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-violet-400 transition-colors">
            <Music2 className="w-12 h-12 stroke-1" />
          </div>
        )}

        {/* Hover overlay & Play button */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
          isThisSongPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-violet-600/40 hover:scale-110 active:scale-95 transition-transform"
            aria-label={isThisSongPlaying ? 'Pause' : 'Play'}
          >
            {isThisSongPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Genre Pill */}
        {song.genre && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-violet-300 border border-violet-500/20">
            {song.genre}
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-white text-sm truncate group-hover:text-violet-300 transition-colors">
          {song.title}
        </h4>
        <p className="text-xs text-slate-400 truncate">
          {song.artist}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-xs text-slate-500">
        <span>{formatDuration(song.duration)}</span>
        <div className="flex items-center gap-1.5">
          {onAddToPlaylist && !isSpotifyTrack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist(song);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Add to Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {!isSpotifyTrack && (
            <button
              onClick={handleFavoriteClick}
              disabled={favLoading}
              className={`p-1.5 rounded-lg transition-colors ${
                favorite
                  ? 'text-rose-500 hover:text-rose-400'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-white/5'
              }`}
              title={favorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
