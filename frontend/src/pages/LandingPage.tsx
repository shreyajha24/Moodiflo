import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, AudioWaveform } from 'lucide-react';
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
      if (data.length > 0) setSelectedMood(data[0].name);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedMood) {
      moodService
        .getRecommendations(selectedMood)
        .then((res) => setMoodSongs(res.songs.slice(0, 4)))
        .catch(() => {});
    }
  }, [selectedMood]);

  const currentTheme = getMoodTheme(selectedMood);

  return (
    <div className="space-y-14 pb-12 pt-4 sm:space-y-18">
      <section className="panel relative flex flex-col items-center justify-center overflow-hidden p-6 text-center sm:p-10 md:p-14">
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl transition-all duration-700 sm:h-96 sm:w-96"
          style={{ background: currentTheme.primaryColor }}
        />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-cyan)' }}
          >
            <AudioWaveform className="h-4 w-4" strokeWidth={1.75} />
            Moodiflo
          </div>

          <h1 className="page-title !mt-0 text-center" style={{ fontSize: 'clamp(2.4rem, 7vw, 4.6rem)' }}>
            Moodiflo
          </h1>
          <p className="page-copy mx-auto !mt-2 text-center text-base sm:text-lg">
            Shift your mood. Discover the sound. A futuristic music space for where you are — and where you want to go.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(isAuthenticated ? '/home' : '/register')}
              className="button-primary px-6 py-3.5 sm:px-8"
            >
              Enter Moodiflo
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button onClick={() => navigate('/home')} className="button-quiet px-6 py-3.5 sm:px-8">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-magenta)' }} strokeWidth={1.75} />
              Try Mood Shifter
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <p className="eyebrow">The Moodiflo path</p>
          <h2 className="section-title">Acknowledge. Shift. Discover. Remember.</h2>
          <p className="section-copy mx-auto">
            Glass panels over an atmospheric glow — mood segments, Sargam, Journey, and Diary in one cohesive world.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            ['01', 'Acknowledge', 'Name how you feel — Happy, Calm, Energetic, or anything in between.', 'var(--accent-cyan)'],
            ['02', 'Shift', 'Use the Mood Shifter to move toward the sound you need.', 'var(--accent-purple)'],
            ['03', 'Discover', 'Explore Sargam by place and Journey by evolving taste.', 'var(--accent-magenta)'],
            ['04', 'Remember', 'Keep moments in Diary — songs, notes, and places.', 'var(--accent-pink)'],
          ].map(([n, title, copy, color]) => (
            <div key={n} className="panel-quiet space-y-3 p-5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold"
                style={{
                  color,
                  background: `color-mix(in srgb, ${color} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
                }}
              >
                {n}
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel space-y-8 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Sample the flow</p>
            <h2 className="section-title mt-2">Select a vibe</h2>
            <p className="section-copy mt-1">Real Spotify recommendations for the mood you pick.</p>
          </div>
          <div className="mood-segments">
            {moods.slice(0, 6).map((m) => {
              const th = getMoodTheme(m.name);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.name)}
                  className={`mood-chip ${selectedMood === m.name ? 'is-active' : ''}`}
                >
                  {th.displayName}
                </button>
              );
            })}
          </div>
        </div>

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
