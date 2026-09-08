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
    <article
      onClick={() => navigate(`/songs/${song.id}`)}
      className="panel-quiet panel-hover group relative flex cursor-pointer flex-col justify-between overflow-hidden p-3"
    >
      {/* Cover Image Container */}
      <div className="artwork relative mb-3 aspect-square w-full rounded-[0.9rem]">
        {song.coverImageUrl ? (
          <img
            src={song.coverImageUrl}
            alt={song.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // fallback if URL broken
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="artwork-placeholder">
            <Music2 className="w-12 h-12 stroke-1" />
          </div>
        )}

        {/* Hover overlay & Play button */}
        <div className={`absolute inset-0 flex items-center justify-center bg-[#0B1020]/60 transition-opacity duration-300 ${
          isThisSongPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={handlePlayClick}
            className="grid h-11 w-11 place-items-center rounded-full bg-[#D9B56D] text-[#0B1020] transition-transform hover:scale-105 active:scale-95"
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
          <span className="absolute left-2.5 top-2.5 border border-white/15 bg-[#0B1020]/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A7ABC0]">
            {song.genre}
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1">
        <h4 className="truncate text-sm font-semibold text-[#EDEAF7] transition-colors group-hover:text-white">
          {song.title}
        </h4>
        <p className="truncate text-xs text-[#A7ABC0]">
          {song.artist}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2 text-xs text-[#737B95]">
        <span>{formatDuration(song.duration)}</span>
        <div className="flex items-center gap-1.5">
          {onAddToPlaylist && !isSpotifyTrack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist(song);
              }}
              className="rounded p-1.5 text-[#A7ABC0] hover:bg-white/5 hover:text-white"
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
                  ? 'text-[#D9B56D]'
                  : 'text-[#A7ABC0] hover:bg-white/5 hover:text-[#D9B56D]'
              }`}
              title={favorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            </button>
          )}
      </div>
    </div>
    </article>
  );
};
