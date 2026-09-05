import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Languages,
  Headphones,
  Sliders,
  Compass,
  Disc3,
} from 'lucide-react';
import { moodService } from '../services/moodService';
import { songService } from '../services/songService';
import type { MoodView, SongView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { SongCard } from '../components/common/SongCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [moods, setMoods] = useState<MoodView[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('HAPPY');
  const [moodSongs, setMoodSongs] = useState<SongView[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<SongView[]>([]);
  const [isLoadingMoodSongs, setIsLoadingMoodSongs] = useState<boolean>(false);

  useEffect(() => {
    moodService.getAllMoods().then((data) => {
      setMoods(data);
      if (data.length > 0) {
        setSelectedMood(data[0].name);
      }
    }).catch(() => {});

    songService.getAllSongs(0, 6).then((data) => {
      setTrendingSongs(data.content);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedMood) {
      setIsLoadingMoodSongs(true);
      moodService
        .getRecommendations(selectedMood)
        .then((res) => {
          setMoodSongs(res.songs.slice(0, 4));
        })
        .catch(() => {})
        .finally(() => setIsLoadingMoodSongs(false));
    }
  }, [selectedMood]);

  return (
    <div className="space-y-20 pt-4">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-16 border border-white/10 text-center flex flex-col items-center justify-center bg-gradient-to-b from-violet-950/30 via-slate-900/40 to-transparent">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI & Mood-Driven Music Streaming Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Music That Matches <br />
            <span className="gradient-text">How You Truly Feel</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
            Move beyond static playlists. Moodify blends real-time mood intelligence, emotional intensity controls, and instant multi-language lyrics translation into a fluid music experience.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate(isAuthenticated ? '/home' : '/register')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {isAuthenticated ? 'Go To Your Feed' : 'Start Listening Free'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/moods')}
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-violet-400" />
              Explore All Moods
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Mood Teaser */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Interactive Mood Test
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Select Your Mood Right Now
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Click any mood chip to trigger live recommendations from our deterministic scoring backend.
          </p>
        </div>

        {/* Mood Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {moods.slice(0, 8).map((m) => {
            const isSelected = selectedMood.toUpperCase() === m.name.toUpperCase();
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 scale-105'
                    : 'glass-panel text-slate-300 hover:text-white hover:border-violet-500/30'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Recommended Tracks for Selected Mood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingMoodSongs ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="glass-panel p-4 rounded-2xl animate-pulse h-64" />
              ))
          ) : moodSongs.length > 0 ? (
            moodSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={moodSongs}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              No recommendations found for this mood yet.
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Why Music Lovers Choose Moodify
          </h2>
          <p className="text-slate-400 text-sm">
            Engineered with deep mood classification, customizable intensity sessions, and global lyric translations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-3xl p-8 border border-white/5 space-y-4 hover:border-violet-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Mood Session Generator</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Fine-tune music by emotional intensity (from soft chill at 20% to explosive energy at 90%) and preferred languages.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/5 space-y-4 hover:border-violet-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Language Lyrics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Translate song lyrics into Spanish, French, Hindi, and more on demand with side-by-side verse viewing.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/5 space-y-4 hover:border-violet-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Adaptive Home Feed</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Dynamically adapts to your listening history, time of day, and past completion rates without generic recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Songs Section */}
      {trendingSongs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Disc3 className="w-6 h-6 text-violet-400" />
              Popular On Moodify
            </h2>
            <button
              onClick={() => navigate('/songs')}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              View All Songs →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} playlistContext={trendingSongs} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
