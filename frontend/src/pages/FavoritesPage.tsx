import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Loader2 } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import type { SongView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/common/SongCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playSong } = usePlayer();

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

  const handleFavoriteChange = (songId: number, isFav: boolean) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((s) => s.id !== songId));
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Heart}
        title="Save Your Favorite Music"
        description="Log in to access your personal favorites library and sync across your sessions."
        actionText="Log In Now"
        onAction={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            Favorite Songs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {favorites.length} saved {favorites.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={() => playSong(favorites[0], favorites, 'FAVORITES')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Play All Favorites
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
          title="No favorites saved yet"
          description="Click the heart icon on any song to save it to your personal favorites collection."
          actionText="Explore Songs"
          onAction={() => navigate('/songs')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {favorites.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isFavorite={true}
              onFavoriteChange={handleFavoriteChange}
              playlistContext={favorites}
            />
          ))}
        </div>
      )}
    </div>
  );
};
