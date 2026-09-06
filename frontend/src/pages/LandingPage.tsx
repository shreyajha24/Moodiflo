import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Waves,
} from 'lucide-react';
import { moodService } from '../services/moodService';
import type { MoodView, SongView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { SoundPathRow } from '../components/common/SoundPathRow';
import { getMoodTheme } from '../utils/moodTheme';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [moods, setMoods] = useState<MoodView[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('HAPPY');
  const [moodSongs, setMoodSongs] = useState<SongView[]>([]);

  useEffect(() => {
    moodService.getAllMoods().then((data) => {
      setMoods(data);
      if (data.length > 0) {
        setSelectedMood(data[0].name);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedMood) {
      moodService
        .getRecommendations(selectedMood)
        .then((res) => {
          setMoodSongs(res.songs.slice(0, 4));
        })
        .catch(() => {});
    }
  }, [selectedMood]);

  const currentTheme = getMoodTheme(selectedMood);

  return (
    <div className="space-y-24 pt-6 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center flex flex-col items-center justify-center border border-white/10 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent">
        {/* Glow backdrop */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ background: currentTheme.primaryColor }}
        />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-amber-300">
            <Waves className="w-4 h-4 text-amber-400" />
            A New Category of Listening
          </div>

          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight font-display">
            Music that responds to <span className="mood-wave">your mood.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Moodiflo is not another music player. It is an emotional space that senses where you are, lifts your spirit, and lets music flow with you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate(isAuthenticated ? '/home' : '/register')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-violet-600 hover:opacity-90 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              Find Your Flow
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/moods')}
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Try Mood Shifter
            </button>
          </div>
        </div>
      </section>

      {/* Philosophy: Acknowledge -> Understand -> Shift -> Feel Better */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            The Moodiflo Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
            Acknowledge. Understand. Shift. Feel Better.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Conventional apps trap you in rigid algorithms. Moodiflo understands that your feelings are fluid, guiding you into a healthier state of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Acknowledge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Name what you feel without judgment — whether high energy, radiant joy, or quiet fatigue.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Understand</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe your day in your own natural words. Moodiflo classifies your emotional frequency.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Shift</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never get stuck in sadness. Choose your destination vibe and let harmonic bridges guide you.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
              04
            </div>
            <h3 className="text-lg font-bold text-white">Feel Better</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience seamless music streaming with multi-language lyric translations that touch your soul.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Vibe Playground */}
      <section className="rounded-3xl p-8 md:p-12 border border-white/10 bg-white/[0.02] space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Sample The Flow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select any vibe to see how Moodiflo tunes the soundscape.
            </p>
          </div>

          {/* Quick mood chips */}
          <div className="flex flex-wrap gap-2">
            {moods.slice(0, 6).map((m) => {
              const th = getMoodTheme(m.name);
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    selectedMood === m.name
                      ? `${th.badgeClasses} shadow-md`
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{th.emoji}</span>
                  <span>{th.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tracks Stream */}
        <div className="space-y-1.5">
          {moodSongs.map((song, idx) => (
            <SoundPathRow
              key={song.id}
              index={idx}
              song={song}
              playlistContext={moodSongs}
              activeMood={selectedMood}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
