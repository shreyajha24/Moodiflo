import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Plus, Music2, ExternalLink } from 'lucide-react';
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

  const handleCardClick = () => {
    if (isSpotifyTrack) playSong(song, playlistContext || [song]);
    else navigate(`/songs/${song.id}`);
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
      onClick={handleCardClick}
      className={`music-card ${isThisSongPlaying ? 'is-playing' : ''}`}
    >
      <div className="music-card-art">
        {song.coverImageUrl ? (
          <img
            src={song.coverImageUrl}
            alt={song.title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="artwork-placeholder">
            <Music2 className="h-10 w-10" strokeWidth={1.5} />
          </div>
        )}

        <div className="music-card-play">
          <button
            onClick={handlePlayClick}
            className="player-play"
            aria-label={isThisSongPlaying ? 'Pause' : 'Play'}
          >
            {isThisSongPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </button>
        </div>

        {song.genre && (
          <span
            className="absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
            style={{
              borderColor: 'var(--border)',
              background: 'color-mix(in srgb, var(--background) 70%, transparent)',
              color: 'var(--text-secondary)',
            }}
          >
            {song.genre}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 px-0.5">
        <h4 className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {song.title}
        </h4>
        <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
          {song.artist}
        </p>
      </div>

      <div
        className="mt-auto flex items-center justify-between border-t pt-2 text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <span>{formatDuration(song.duration)}</span>
        <div className="flex items-center gap-1">
          {isSpotifyTrack && song.spotifyExternalUrl && (
            <a
              href={song.spotifyExternalUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
              style={{ color: 'var(--accent-cyan)' }}
              title="Open in Spotify"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            </a>
          )}
          {onAddToPlaylist && !isSpotifyTrack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist(song);
              }}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
              title="Add to Playlist"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}

          {!isSpotifyTrack && (
            <button
              onClick={handleFavoriteClick}
              disabled={favLoading}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
              style={{ color: favorite ? 'var(--accent-magenta)' : 'var(--text-secondary)' }}
              title={favorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
