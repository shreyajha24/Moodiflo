import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Sliders,
  Send,
  Loader2,
  Play,
  Waves,
} from 'lucide-react';
import { moodService } from '../services/moodService';
import type { MoodSessionResponse, MoodView, QueryResponse } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { useToast } from '../hooks/useToast';
import { MoodCard } from '../components/common/MoodCard';
import { SoundPathRow } from '../components/common/SoundPathRow';
import { MoodCardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';
import { getMoodTheme, isLowMood, getShiftTargets } from '../utils/moodTheme';

const SAMPLE_QUERIES = [
  'I need calming ambient music for deep focus and study',
  'High energy workout tracks to get pumped up',
  'Gentle acoustic songs to warm a quiet evening',
  'Late night nostalgic chill with great lyrics',
];

export const MoodsPage: React.FC = () => {
  const { playSong, setActiveMood } = usePlayer();
  const { success, error, info } = useToast();

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

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setIsQuerying(true);
    try {
      const res = await moodService.discoverQuery(naturalQuery.trim());
      setQueryResult(res);
      if (res.interpretedMood) {
        setActiveMood(res.interpretedMood);
      }
      success(`Tuned into ${getMoodTheme(res.interpretedMood).displayName} wave (${Math.round(res.confidence * 100)}% match)`);
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
      setActiveMood(sessionMood);
      success(`Generated session: "${res.playlistName}"!`);
      setShowSessionModal(false);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setIsGeneratingSession(false);
    }
  };

  const detectedTheme = getMoodTheme(queryResult?.interpretedMood);
  const isDetectedLow = isLowMood(queryResult?.interpretedMood);
  const detectedShifts = getShiftTargets(queryResult?.interpretedMood);

  return (
    <div className="space-y-16 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            Emotional Frequency
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            Shift Your Vibe
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-xl">
            Explore our curated emotional states, describe how you feel in plain human language, or craft a personalized mood journey.
          </p>
        </div>

        <button
          onClick={() => setShowSessionModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-violet-600 hover:opacity-90 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all w-fit cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          Craft Custom Session
        </button>
      </div>

      {/* 1. Natural Language Emotion Finder */}
      <section className="rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <Waves className="w-5 h-5 text-amber-400" />
              Describe How You Feel
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Type anything from &quot;exhausted after a long week&quot; to &quot;bursting with creative inspiration&quot;. Moodiflo will interpret your state and tune your soundscape.
            </p>
          </div>

          <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. I need something gentle and calming for late night writing..."
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition-all"
            />
            <button
              type="submit"
              disabled={isQuerying || !naturalQuery.trim()}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer shrink-0"
            >
              {isQuerying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Interpreting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Tune In
                </>
              )}
            </button>
          </form>

          {/* Quick inspiration chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Try asking:</span>
            {SAMPLE_QUERIES.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNaturalQuery(sample)}
                className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
              >
                &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Query Results Section */}
        {queryResult && (
          <div className="mt-8 pt-6 border-t border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{detectedTheme.emoji}</span>
                  <h3 className="text-xl font-black text-white font-display">
                    Detected Mood: <span className="capitalize">{detectedTheme.displayName}</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-amber-300 border border-white/10">
                    {Math.round(queryResult.confidence * 100)}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-400">{detectedTheme.vibeTagline}</p>
              </div>

              {queryResult.songs.length > 0 && (
                <button
                  onClick={() => playSong(queryResult.songs[0], queryResult.songs, queryResult.interpretedMood)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/10 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play Matched Soundscape
                </button>
              )}
            </div>

            {/* If detected low/sad, offer immediate shift bridge */}
            {isDetectedLow && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Feeling low? Shift the vibe forward:
                </p>
                <div className="flex flex-wrap gap-2">
                  {detectedShifts.map((sh) => (
                    <button
                      key={sh.targetMood}
                      onClick={() => {
                        setActiveMood(sh.targetMood);
                        info(`Shifting vibe toward ${sh.label}!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{sh.emoji}</span>
                      <span>{sh.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Songs List */}
            <div className="space-y-1.5">
              {queryResult.songs.map((song, idx) => (
                <SoundPathRow
                  key={song.id}
                  index={idx}
                  song={song}
                  playlistContext={queryResult.songs}
                  activeMood={queryResult.interpretedMood}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. Custom Session Result Banner */}
      {sessionResult && (
        <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-violet-500/20 border border-amber-400/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Custom Session Created</span>
              <h3 className="text-2xl font-black text-white font-display">{sessionResult.playlistName}</h3>
              <p className="text-xs text-slate-300">{sessionResult.songs.length} tracks tailored to your flow</p>
            </div>
            {sessionResult.songs.length > 0 && (
              <button
                onClick={() => playSong(sessionResult.songs[0], sessionResult.songs, sessionResult.mood)}
                className="px-6 py-3 rounded-full bg-white text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Session
              </button>
            )}
          </div>

          <div className="space-y-1.5 pt-2">
            {sessionResult.songs.map((song, idx) => (
              <SoundPathRow
                key={song.id}
                index={idx}
                song={song}
                playlistContext={sessionResult.songs}
                activeMood={sessionResult.mood}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. The 12 Mood Archetypes Catalog */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            The Mood Archetypes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dive into any frequency to discover hand-curated tracks and dedicated soundscapes.
          </p>
        </div>

        {errorMessage && <ErrorState message={errorMessage} onRetry={loadMoods} />}

        {isLoadingMoods ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <MoodCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {moods.map((mood) => (
              <MoodCard key={mood.id} mood={mood} />
            ))}
          </div>
        )}
      </section>

      {/* Custom Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#131522] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white font-display">Craft Mood Session</h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize frequency, intensity, and language</p>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-5">
              {/* Mood Pick */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Target Emotion</label>
                <div className="grid grid-cols-3 gap-2">
                  {moods.slice(0, 9).map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setSessionMood(m.name)}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center border transition-all cursor-pointer ${
                        sessionMood === m.name
                          ? 'bg-amber-400/20 border-amber-400 text-white'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{getMoodTheme(m.name).emoji}</span>
                      <span className="capitalize">{getMoodTheme(m.name).displayName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Intensity Level</span>
                  <span className="font-mono text-amber-400 font-bold">{Math.round(sessionIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={sessionIntensity}
                  onChange={(e) => setSessionIntensity(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Subtle & Gentle</span>
                  <span>Peak & Immersive</span>
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Preferred Track Language</label>
                <select
                  value={sessionLanguage}
                  onChange={(e) => setSessionLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="English" className="bg-[#141622]">English</option>
                  <option value="Hindi" className="bg-[#141622]">Hindi</option>
                  <option value="Spanish" className="bg-[#141622]">Spanish</option>
                  <option value="French" className="bg-[#141622]">French</option>
                  <option value="Korean" className="bg-[#141622]">Korean</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingSession}
                  className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isGeneratingSession ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Session'
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
