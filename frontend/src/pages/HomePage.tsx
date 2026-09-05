import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Headphones,
  Disc3,
  Sun,
  Moon,
  Sunset,
  Play,
} from 'lucide-react';
import { homeService } from '../services/homeService';
import type { DiscoveryResponse } from '../types';
import { useAuth } from '../hooks/useAuth';
import { SongCard } from '../components/common/SongCard';
import { MoodCard } from '../components/common/MoodCard';
import { SongCardSkeleton, MoodCardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feed, setFeed] = useState<DiscoveryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHome = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await homeService.getHomeFeed();
      setFeed(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sun className="w-6 h-6 text-amber-400" />;
    if (hour < 18) return <Sunset className="w-6 h-6 text-orange-400" />;
    return <Moon className="w-6 h-6 text-indigo-400" />;
  };

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={loadHome} />;
  }

  return (
    <div className="space-y-12 pb-10">
      {/* Personalized Greeting Banner */}
      <section className="relative glass-panel rounded-3xl p-6 md:p-10 border border-white/10 overflow-hidden bg-gradient-to-r from-violet-950/40 via-indigo-950/20 to-slate-900/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-400 mb-2">
              {getGreetingIcon()}
              <span>Personalized For You</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {feed?.greeting || `Welcome, ${user?.name || 'Listener'}!`}
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Here is your daily audio mix tuned to your mood preferences and listening history.
            </p>
          </div>

          {feed?.suggestedMood && (
            <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-violet-600/10 flex flex-col gap-3 min-w-[240px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Suggested Mood
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200 font-semibold">
                  Right Now
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {feed.suggestedMood}
              </div>
              <button
                onClick={() => navigate(`/moods/${encodeURIComponent(feed.suggestedMood)}`)}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Listen to {feed.suggestedMood}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Mood Cards Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Explore By Mood
            </h2>
            <p className="text-xs text-slate-400">Tap a mood to unlock tailored soundscapes</p>
          </div>
          <button
            onClick={() => navigate('/moods')}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300"
          >
            All Moods →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => <MoodCardSkeleton key={i} />)
            : feed?.moodCards?.slice(0, 4).map((m) => <MoodCard key={m.id} mood={m} />)}
        </div>
      </section>

      {/* Continue Listening (if present) */}
      {feed?.continueListening && feed.continueListening.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-cyan-400" />
            Continue Listening
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {feed.continueListening.map((song) => (
              <SongCard key={song.id} song={song} playlistContext={feed.continueListening} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended For You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-violet-400" />
              Recommended For You
            </h2>
            <p className="text-xs text-slate-400">Curated based on your taste and favorites</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array(6)
                .fill(0)
                .map((_, i) => <SongCardSkeleton key={i} />)
            : feed?.recommendedForYou?.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  playlistContext={feed.recommendedForYou}
                />
              ))}
        </div>
      </section>

      {/* Because You Listened */}
      {feed?.becauseYouListened && feed.becauseYouListened.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            Because You Listened
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {feed.becauseYouListened.map((song) => (
              <SongCard key={song.id} song={song} playlistContext={feed.becauseYouListened} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Tracks */}
      {feed?.trending && feed.trending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Trending Now
            </h2>
            <button
              onClick={() => navigate('/songs')}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              Browse All Songs →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {feed.trending.map((song) => (
              <SongCard key={song.id} song={song} playlistContext={feed.trending} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
