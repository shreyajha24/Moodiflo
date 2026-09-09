import React from 'react';
import { Play, Pause, Heart, Plus, Music2, Clock } from 'lucide-react';
import type { SongView } from '../../types';
import { usePlayer } from '../../hooks/usePlayer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { favoriteService } from '../../services/favoriteService';
import { getMoodTheme } from '../../utils/moodTheme';

interface FeaturedFlowCardProps {
  song: SongView;
  moodName?: string;
  playlistContext?: SongView[];
  onAddToPlaylist?: (song: SongView) => void;
}

export const FeaturedFlowCard: React.FC<FeaturedFlowCardProps> = ({
  song,
  moodName = 'HAPPY',
  playlistContext,
  onAddToPlaylist,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const isThisSongPlaying = currentSong?.id === song.id && isPlaying;
  const theme = getMoodTheme(moodName);

  const handlePlay = () => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, playlistContext || [song], moodName);
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
        success(`Removed from favorites`);
      } else {
        await favoriteService.addFavorite(song.id);
        setIsFavorite(true);
        success(`Saved to your favorites`);
      }
    } catch {
      // ignore
    }
  };

  const formatDuration = (secs?: number | null) => {
    if (!secs) return '3:20';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 shadow-2xl transition-all"
      style={{
        boxShadow: `0 20px 50px -20px ${theme.primaryColor}30`,
      }}
    >
      {/* Background Soft Glow */}
      <div
        className="absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: theme.primaryColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
        {/* Large Artwork */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shrink-0 shadow-2xl group">
          {song.coverImageUrl ? (
            <img
              src={song.coverImageUrl}
              alt={song.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-[#161824] flex items-center justify-center text-slate-500">
              <Music2 className="w-16 h-16" />
            </div>
          )}

          {/* Quick Play Overlay */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
              {isThisSongPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </div>
          </button>
        </div>

        {/* Narrative & Details */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.badgeClasses}`}>
              <span>{theme.emoji}</span>
              Featured in {theme.displayName}
            </span>
            {song.genre && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs border border-white/5">
                {song.genre}
              </span>
            )}
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(song.duration)}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {song.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-medium">
            {song.artist}
            {song.album && <span className="text-slate-500 font-normal"> — {song.album}</span>}
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl line-clamp-2 leading-relaxed">
            {song.description || theme.vibeTagline}
          </p>

          {/* Action Row */}
          <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={handlePlay}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isThisSongPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  Pause Stream
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Flow Into This Track
                </>
              )}
            </button>

            <button
              onClick={handleFavorite}
              className={`p-3 rounded-full border transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {onAddToPlaylist && (
              <button
                onClick={() => onAddToPlaylist(song)}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Add to playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
