import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Sliders,
  Send,
  Loader2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { moodService } from '../services/moodService';
import type { MoodSessionResponse, MoodView, QueryResponse } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { useToast } from '../hooks/useToast';
import { MoodCard } from '../components/common/MoodCard';
import { SongCard } from '../components/common/SongCard';
import { MoodCardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

const SAMPLE_QUERIES = [
  'I need calming ambient music for deep focus and study',
  'High energy workout tracks to get pumped up',
  'Romantic acoustic vibes for a dinner date',
  'Late night nostalgic chill songs with great lyrics',
];

export const MoodsPage: React.FC = () => {
  const { playSong } = usePlayer();
  const { success, error } = useToast();

  const [moods, setMoods] = useState<MoodView[]>([]);
  const [isLoadingMoods, setIsLoadingMoods] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Natural language query state
  const [naturalQuery, setNaturalQuery] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  // Mood session state
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [sessionMood, setSessionMood] = useState<string>('HAPPY');
  const [sessionIntensity, setSessionIntensity] = useState<number>(0.75);
  const [sessionLanguage, setSessionLanguage] = useState<string>('English');
  const [isGeneratingSession, setIsGeneratingSession] = useState<boolean>(false);
  const [sessionResult, setSessionResult] = useState<MoodSessionResponse | null>(null);

  const loadMoods = async () => {
    setIsLoadingMoods(true);
    setErrorMessage(null);
    try {
      const data = await moodService.getAllMoods();
      setMoods(data);
      if (data.length > 0) {
        setSessionMood(data[0].name);
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoadingMoods(false);
    }
  };

  useEffect(() => {
    loadMoods();
  }, []);

  const handleQuerySubmit = async (queryText?: string) => {
    const q = queryText || naturalQuery;
    if (!q.trim()) return;

    setIsQuerying(true);
    try {
      const res = await moodService.discoverQuery(q.trim());
      setQueryResult(res);
      success(`Identified mood: ${res.interpretedMood} (${Math.round(res.confidence * 100)}% match)`);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingSession(true);
    try {
      const res = await moodService.createMoodSession({
        mood: sessionMood,
        intensity: sessionIntensity,
        language: sessionLanguage,
      });
      setSessionResult(res);
      success(`Generated session: "${res.playlistName}"!`);
      setShowSessionModal(false);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setIsGeneratingSession(false);
    }
  };

  return (
    <div className="space-y-14 pb-12">
      {/* Header & Natural Language Discovery Hero */}
      <section className="relative glass-panel rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden bg-gradient-to-br from-violet-950/40 via-slate-900/50 to-indigo-950/30">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Natural Language Emotion Discovery
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            How Are You Feeling?
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
            Tell Moodify your thoughts, current vibe, or activity in plain language. Our AI engine classifies your emotional tone and serves an instant sonic prescription.
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuerySubmit();
            }}
            className="relative flex items-center mb-4"
          >
            <input
              type="text"
              placeholder="e.g. 'I want something calm for late night reading'..."
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              className="w-full pl-5 pr-28 py-4 rounded-2xl bg-black/40 border border-white/15 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:bg-black/60 shadow-xl transition-all"
            />
            <button
              type="submit"
              disabled={isQuerying || !naturalQuery.trim()}
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isQuerying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Discover</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try asking:</span>
            {SAMPLE_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setNaturalQuery(sq);
                  handleQuerySubmit(sq);
                }}
                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors truncate max-w-xs"
              >
                "{sq}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Query Results Section (if active) */}
      {queryResult && (
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-violet-500/30 bg-violet-950/20 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-white">
                  Identified Mood: <span className="text-violet-400">{queryResult.interpretedMood}</span>
                </h3>
                <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-bold">
                  {Math.round(queryResult.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Found {queryResult.songs.length} tailored tracks for your prompt
              </p>
            </div>

            <div className="flex items-center gap-3">
              {queryResult.songs.length > 0 && (
                <button
                  onClick={() => playSong(queryResult.songs[0], queryResult.songs, queryResult.interpretedMood)}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play All Matches
                </button>
              )}
              <button
                onClick={() => setQueryResult(null)}
                className="p-2 text-slate-400 hover:text-white"
                title="Dismiss"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {queryResult.songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={queryResult.songs}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mood Session Generator Trigger Banner */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-violet-950/20">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            Custom Session Mode
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Fine-Tune Your Mood Intensity Session
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Dial in precise intensity percentages and target music languages to synthesize a dedicated listening session.
          </p>
        </div>

        <button
          onClick={() => setShowSessionModal(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2"
        >
          <Sliders className="w-4 h-4" />
          Configure Session
        </button>
      </section>

      {/* Generated Session Results (if active) */}
      {sessionResult && (
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Active Session
              </span>
              <h3 className="text-2xl font-black text-white">{sessionResult.playlistName}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Mood: <span className="font-semibold text-white">{sessionResult.mood}</span> • {sessionResult.songs.length} tracks
              </p>
            </div>

            <div className="flex items-center gap-3">
              {sessionResult.songs.length > 0 && (
                <button
                  onClick={() => playSong(sessionResult.songs[0], sessionResult.songs, sessionResult.mood)}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play Session
                </button>
              )}
              <button
                onClick={() => setSessionResult(null)}
                className="p-2 text-slate-400 hover:text-white"
                title="Close"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {sessionResult.songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={sessionResult.songs}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mood Catalog Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">All Mood Atmospheres</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse our full taxonomy of 12 classified mood ecosystems
          </p>
        </div>

        {errorMessage && <ErrorState message={errorMessage} onRetry={loadMoods} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoadingMoods
            ? Array(8)
                .fill(0)
                .map((_, i) => <MoodCardSkeleton key={i} />)
            : moods.map((m) => <MoodCard key={m.id} mood={m} />)}
        </div>
      </section>

      {/* Mood Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#12141f] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">Create Mood Session</h3>
            <p className="text-xs text-slate-400 mb-6">
              Synthesize a dynamic playlist matched to your target emotion.
            </p>

            <form onSubmit={handleCreateSession} className="space-y-5">
              {/* Mood Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Target Mood
                </label>
                <select
                  value={sessionMood}
                  onChange={(e) => setSessionMood(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  {moods.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.emoji} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Intensity Slider */}
              <div>
                <div className="flex justify-between items-center mb-2 text-xs font-semibold text-slate-300">
                  <span className="uppercase tracking-wider">Intensity Level</span>
                  <span className="text-violet-400">{Math.round(sessionIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={sessionIntensity}
                  onChange={(e) => setSessionIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 accent-violet-500 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Mellow (10%)</span>
                  <span>Moderate (50%)</span>
                  <span>Intense (100%)</span>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Language Preference
                </label>
                <select
                  value={sessionLanguage}
                  onChange={(e) => setSessionLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingSession}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingSession ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Start Session
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
