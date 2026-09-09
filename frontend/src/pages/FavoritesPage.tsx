import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Heart, Play, Loader2 } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import type { SongView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { SoundPathRow } from '../components/common/SoundPathRow';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

interface OutletContextType {
  openAddToPlaylist: (song: SongView) => void;
}

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playSong } = usePlayer();
  const outletContext = useOutletContext<OutletContextType>();

  const [favorites, setFavorites] = useState<SongView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Heart}
        title="Your Personal Sound Sanctuary"
        description="Sign in to save music that resonates with your emotional flow."
        actionText="Sign In"
        onAction={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 font-display">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            Loved Tracks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {favorites.length} {favorites.length === 1 ? 'track' : 'tracks'} held close to your heart
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={() => playSong(favorites[0], favorites, 'ROMANTIC')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-cyan-400 hover:opacity-90 text-slate-950 font-black text-xs shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Flow Through Favorites
          </button>
        )}
      </div>

      {errorMessage && <ErrorState message={errorMessage} onRetry={loadFavorites} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your heart space is quiet"
          description="Save music that moves you to build your personal sanctuary."
          actionText="Discover Moods"
          onAction={() => navigate('/moods')}
        />
      ) : (
        <div className="space-y-1.5">
          {favorites.map((song, idx) => (
            <SoundPathRow
              key={song.id}
              index={idx}
              song={song}
              playlistContext={favorites}
              onAddToPlaylist={outletContext?.openAddToPlaylist}
              activeMood="ROMANTIC"
            />
          ))}
        </div>
      )}
    </div>
  );
};
