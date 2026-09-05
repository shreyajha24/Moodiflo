import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles, Music, Loader2 } from 'lucide-react';
import { moodService } from '../services/moodService';
import type { SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/common/SongCard';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

export const MoodDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const [songs, setSongs] = useState<SongView[]>([]);
  const [moodTitle, setMoodTitle] = useState<string>(name || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecommendations = async () => {
    if (!name) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await moodService.getRecommendations(name);
      setSongs(data.songs);
      setMoodTitle(data.mood || name.toUpperCase());
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [name]);

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/moods')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Moods
      </button>

      {/* Mood Hero Header */}
      <section className="relative glass-panel rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden bg-gradient-to-br from-violet-950/50 via-slate-900/60 to-indigo-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Mood Playlist
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight">
              {moodTitle}
            </h1>
            <p className="text-sm text-slate-300 max-w-lg">
              Carefully curated songs tuned to evoke and complement the {moodTitle.toLowerCase()} atmosphere.
            </p>
            <p className="text-xs text-slate-500">
              {songs.length} tracks available
            </p>
          </div>

          {songs.length > 0 && (
            <button
              onClick={() => playSong(songs[0], songs, moodTitle)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Play All Songs
            </button>
          )}
        </div>
      </section>

      {/* Recommended Songs Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-violet-400" />
          Recommended Soundtracks
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={loadRecommendations} />
        ) : songs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-500">
            No tracks found matching this mood.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={songs}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
