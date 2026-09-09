import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { History, Play, Loader2, Waves } from 'lucide-react';
import { historyService } from '../services/historyService';
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

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playSong } = usePlayer();
  const outletContext = useOutletContext<OutletContextType>();

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
        title="Your Flow Journey"
        description="Sign in to revisit tracks you've streamed and resume your musical journeys anytime."
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
            <History className="w-8 h-8 text-cyan-400" />
            Flow History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {history.length} {history.length === 1 ? 'track' : 'tracks'} recorded from your listening sessions
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => playSong(history[0], history, 'FOCUS')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-rose-500 hover:opacity-90 text-slate-950 font-black text-xs shadow-lg shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Replay Stream
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
          icon={Waves}
          title="No stream history yet"
          description="Begin playing songs or exploring mood sessions to see your flow recorded here."
          actionText="Discover Moods"
          onAction={() => navigate('/moods')}
        />
      ) : (
        <div className="space-y-1.5">
          {history.map((song, index) => (
            <SoundPathRow
              key={`${song.id}-${index}`}
              index={index}
              song={song}
              playlistContext={history}
              onAddToPlaylist={outletContext?.openAddToPlaylist}
              activeMood="FOCUS"
            />
          ))}
        </div>
      )}
    </div>
  );
};
