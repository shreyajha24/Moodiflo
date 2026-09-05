import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Play, Loader2, Music2 } from 'lucide-react';
import { historyService } from '../services/historyService';
import type { SongView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/common/SongCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playSong } = usePlayer();

  const [history, setHistory] = useState<SongView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={History}
        title="Listening History"
        description="Log in to track songs you've played and resume your musical journeys anytime."
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
            <History className="w-8 h-8 text-cyan-400" />
            Recently Played
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {history.length} {history.length === 1 ? 'track' : 'tracks'} recorded from your listening sessions
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => playSong(history[0], history, 'HISTORY')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Play Recent Songs
          </button>
        )}
      </div>

      {errorMessage && <ErrorState message={errorMessage} onRetry={loadHistory} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No listening history yet"
          description="Start playing some music or explore mood playlists to see your history here."
          actionText="Discover Moods"
          onAction={() => navigate('/moods')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {history.map((song, index) => (
            <SongCard
              key={`${song.id}-${index}`}
              song={song}
              playlistContext={history}
            />
          ))}
        </div>
      )}
    </div>
  );
};
