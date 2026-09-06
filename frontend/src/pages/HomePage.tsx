import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Sun,
  Moon,
  Sunset,
  Play,
  ArrowRight,
  Waves,
} from 'lucide-react';
import { homeService } from '../services/homeService';
import { moodService } from '../services/moodService';
import type { DiscoveryResponse, SongView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useToast } from '../hooks/useToast';
import { FeaturedFlowCard } from '../components/common/FeaturedFlowCard';
import { SoundPathRow } from '../components/common/SoundPathRow';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';
import { getMoodTheme, isLowMood, getShiftTargets, MOOD_THEMES } from '../utils/moodTheme';

interface OutletContextType {
  openAddToPlaylist: (song: SongView) => void;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeMood, setActiveMood, playSong } = usePlayer();
  const { info } = useToast();
  const outletContext = useOutletContext<OutletContextType>();

  const [feed, setFeed] = useState<DiscoveryResponse | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>(activeMood || 'HAPPY');
  const [moodRecommendations, setMoodRecommendations] = useState<SongView[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Shift module state
  const [shiftStart, setShiftStart] = useState<string>('SAD');
  const [shiftTarget, setShiftTarget] = useState<string>('HAPPY');

  const currentTheme = getMoodTheme(selectedMood);
  const isSelectedLow = isLowMood(selectedMood);
  const shiftOptions = getShiftTargets(selectedMood);

  // Load Home Feed from backend
  const loadHome = async () => {
    setErrorMessage(null);
    try {
      const data = await homeService.getHomeFeed();
      setFeed(data);
      if (data.suggestedMood && !activeMood) {
        setSelectedMood(data.suggestedMood);
        setActiveMood(data.suggestedMood);
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  // Load recommendations for selected mood
  const loadMoodRecs = async (moodName: string) => {
    try {
      const recs = await moodService.getRecommendations(moodName);
      setMoodRecommendations(recs.songs);
    } catch {
      // fallback to feed items if available
      if (feed?.recommendedForYou) {
        setMoodRecommendations(feed.recommendedForYou);
      }
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  useEffect(() => {
    loadMoodRecs(selectedMood);
  }, [selectedMood]);

  const handleSelectMood = (moodKey: string) => {
    setSelectedMood(moodKey);
    setActiveMood(moodKey);
  };

  const handleShiftToTarget = (targetMoodKey: string) => {
    handleSelectMood(targetMoodKey);
    info(`Shifting your vibe toward ${getMoodTheme(targetMoodKey).displayName}!`);
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sun className="w-5 h-5 text-amber-400" />;
    if (hour < 18) return <Sunset className="w-5 h-5 text-orange-400" />;
    return <Moon className="w-5 h-5 text-indigo-400" />;
  };

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={loadHome} />;
  }

  const featuredSong = moodRecommendations[0] || feed?.trending[0] || null;
  const companionSongs = moodRecommendations.slice(1, 6);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Header Greeting & Mood Question */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          {getGreetingIcon()}
          <span>{feed?.greeting || `Hello, ${user ? user.name.split(' ')[0] : 'friend'}`}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-medium">Welcome to Moodiflo</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              How is your soul feeling right now?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Music that responds to where you are — and gently guides you where you want to be.
            </p>
          </div>

          <button
            onClick={() => navigate('/moods')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all w-fit cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Full Mood Explorer
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 2. Expressive Mood Selection Canvas (Visual Hierarchy) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Choose Your Vibe Wave
          </p>
          <span className="text-xs text-slate-500">
            Active: <span className="font-bold text-white capitalize">{currentTheme.displayName}</span>
          </span>
        </div>

        {/* Asymmetric Organic Mood Garden */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* ENERGETIC - High presence */}
          <button
            onClick={() => handleSelectMood('ENERGETIC')}
            className={`col-span-2 sm:col-span-2 lg:col-span-2 p-5 rounded-3xl text-left transition-all relative overflow-hidden border cursor-pointer group ${
              selectedMood === 'ENERGETIC'
                ? 'bg-gradient-to-br from-rose-600/35 via-rose-500/20 to-red-600/10 border-rose-400 shadow-xl shadow-rose-600/20 scale-[1.01]'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl sm:text-4xl">⚡</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                High Pulse
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">Energetic</h3>
            <p className="text-xs text-slate-400 mt-1">Explosive rhythm & unstoppable momentum</p>
          </button>

          {/* HAPPY - High presence */}
          <button
            onClick={() => handleSelectMood('HAPPY')}
            className={`col-span-2 sm:col-span-1 lg:col-span-2 p-5 rounded-3xl text-left transition-all relative overflow-hidden border cursor-pointer group ${
              selectedMood === 'HAPPY'
                ? 'bg-gradient-to-br from-amber-500/35 via-amber-400/20 to-orange-500/10 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.01]'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl sm:text-4xl">☀️</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Radiant
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">Happy</h3>
            <p className="text-xs text-slate-400 mt-1">Joyful melodies to warm your spirit</p>
          </button>

          {/* CALM - Serene wide presence */}
          <button
            onClick={() => handleSelectMood('CALM')}
            className={`col-span-2 sm:col-span-2 lg:col-span-2 p-5 rounded-3xl text-left transition-all relative overflow-hidden border cursor-pointer group ${
              selectedMood === 'CALM'
                ? 'bg-gradient-to-br from-cyan-500/35 via-teal-500/20 to-blue-600/10 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.01]'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl sm:text-4xl">🌊</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                Stillness
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">Calm</h3>
            <p className="text-xs text-slate-400 mt-1">Gentle acoustic waves and deep peace</p>
          </button>

          {/* FOCUS */}
          <button
            onClick={() => handleSelectMood('FOCUS')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              selectedMood === 'FOCUS'
                ? 'bg-indigo-600/30 border-indigo-400 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
            }`}
          >
            <span className="text-2xl mb-1 block">🎯</span>
            <p className="text-sm font-bold text-white">Focus</p>
            <p className="text-[11px] text-slate-400">Deep clarity</p>
          </button>

          {/* PARTY */}
          <button
            onClick={() => handleSelectMood('PARTY')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              selectedMood === 'PARTY'
                ? 'bg-pink-600/30 border-pink-400 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
            }`}
          >
            <span className="text-2xl mb-1 block">🎉</span>
            <p className="text-sm font-bold text-white">Party</p>
            <p className="text-[11px] text-slate-400">Euphoric sound</p>
          </button>

          {/* HOPEFUL */}
          <button
            onClick={() => handleSelectMood('HOPEFUL')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              selectedMood === 'HOPEFUL'
                ? 'bg-emerald-600/30 border-emerald-400 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
            }`}
          >
            <span className="text-2xl mb-1 block">🌱</span>
            <p className="text-sm font-bold text-white">Hopeful</p>
            <p className="text-[11px] text-slate-400">Rising dawn</p>
          </button>

          {/* ROMANTIC */}
          <button
            onClick={() => handleSelectMood('ROMANTIC')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              selectedMood === 'ROMANTIC'
                ? 'bg-rose-600/30 border-rose-400 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
            }`}
          >
            <span className="text-2xl mb-1 block">🌸</span>
            <p className="text-sm font-bold text-white">Romantic</p>
            <p className="text-[11px] text-slate-400">Heart chords</p>
          </button>

          {/* DREAMY */}
          <button
            onClick={() => handleSelectMood('DREAMY')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              selectedMood === 'DREAMY'
                ? 'bg-purple-600/30 border-purple-400 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5'
            }`}
          >
            <span className="text-2xl mb-1 block">✨</span>
            <p className="text-sm font-bold text-white">Dreamy</p>
            <p className="text-[11px] text-slate-400">Twilight haze</p>
          </button>

          {/* SAD / LOW - Understated & Quiet */}
          <button
            onClick={() => handleSelectMood('SAD')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              selectedMood === 'SAD'
                ? 'bg-slate-700/40 border-slate-400 text-slate-200'
                : 'bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-slate-400'
            }`}
          >
            <span className="text-2xl mb-1 block">🌧️</span>
            <p className="text-sm font-medium text-slate-300">Feeling Low?</p>
            <p className="text-[10px] text-slate-500">Acknowledge & shift</p>
          </button>
        </div>
      </section>

      {/* 3. The "Shift Your Vibe" Bridge (Acknowledges Low States and Lifts Up) */}
      {isSelectedLow ? (
        <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-800/60 via-[#181a26] to-slate-900/60 border border-slate-700/50 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>🌧️ Feeling Low</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300">Let's Shift The Vibe</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              We hear you. You don't have to stay here.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Music is the fastest way to gently change your emotional altitude. Choose the feeling you want to move toward:
            </p>

            {/* Shift Option Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {shiftOptions.map((opt) => (
                <button
                  key={opt.targetMood}
                  onClick={() => handleShiftToTarget(opt.targetMood)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-left transition-all group cursor-pointer"
                >
                  <span className="text-2xl p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                    {opt.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      {opt.label}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </p>
                    <p className="text-[11px] text-slate-400">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Editorial Music Experience: Featured Flow Track + Companion Sound Path */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <span>{currentTheme.emoji}</span>
              Your Vibe Right Now: <span className="capitalize">{currentTheme.displayName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {currentTheme.vibeTagline}
            </p>
          </div>

          {moodRecommendations.length > 0 && (
            <button
              onClick={() => playSong(moodRecommendations[0], moodRecommendations, selectedMood)}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Stream Entire Wave
            </button>
          )}
        </div>

        {/* Featured Cinematic Hero */}
        {featuredSong && (
          <FeaturedFlowCard
            song={featuredSong}
            moodName={selectedMood}
            playlistContext={moodRecommendations}
            onAddToPlaylist={outletContext?.openAddToPlaylist}
          />
        )}

        {/* Companion Sound Path Tracks */}
        {companionSongs.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
              Sound Path for this Wave
            </h3>
            <div className="space-y-1.5">
              {companionSongs.map((song, idx) => (
                <SoundPathRow
                  key={song.id}
                  index={idx}
                  song={song}
                  playlistContext={moodRecommendations}
                  onAddToPlaylist={outletContext?.openAddToPlaylist}
                  activeMood={selectedMood}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. "Shift Your Mood" Journey Module (Signature Feature) */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-violet-500/10 border border-white/10 space-y-6">
        <div className="max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
            Signature Feature
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-3">
            Where do you want your music to take you?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick where you are right now, and choose the mood you want to flow into. Moodiflo bridges the gap with harmonious track transitions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
          {/* From Mood */}
          <div className="w-full md:w-1/3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Current Vibe</label>
            <select
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              {Object.keys(MOOD_THEMES).map((m) => (
                <option key={m} value={m} className="bg-[#141622] text-white">
                  {MOOD_THEMES[m].emoji} {MOOD_THEMES[m].displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center justify-center pt-5 text-amber-400">
            <ArrowRight className="w-6 h-6" />
          </div>

          {/* To Mood */}
          <div className="w-full md:w-1/3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Target Vibe</label>
            <select
              value={shiftTarget}
              onChange={(e) => setShiftTarget(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              {Object.keys(MOOD_THEMES).map((m) => (
                <option key={m} value={m} className="bg-[#141622] text-white">
                  {MOOD_THEMES[m].emoji} {MOOD_THEMES[m].displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Launch Shift Button */}
          <div className="w-full md:w-1/3 pt-5">
            <button
              onClick={() => handleShiftToTarget(shiftTarget)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-violet-600 hover:opacity-90 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <Waves className="w-4 h-4" />
              Begin Mood Shift
            </button>
          </div>
        </div>
      </section>

      {/* 6. Trending Currents from Home Feed */}
      {feed?.trending && feed.trending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-400" />
                Trending Currents
              </h2>
              <p className="text-xs text-slate-400">Music widely streamed across Moodiflo</p>
            </div>
            <button
              onClick={() => navigate('/songs')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {feed.trending.slice(0, 5).map((song, idx) => (
              <SoundPathRow
                key={song.id}
                index={idx}
                song={song}
                playlistContext={feed.trending}
                onAddToPlaylist={outletContext?.openAddToPlaylist}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
