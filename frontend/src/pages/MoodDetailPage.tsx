import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { moodService } from '../services/moodService';
import type { SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { useToast } from '../hooks/useToast';
import { FeaturedFlowCard } from '../components/common/FeaturedFlowCard';
import { SoundPathRow } from '../components/common/SoundPathRow';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';
import { getMoodTheme, isLowMood, getShiftTargets } from '../utils/moodTheme';

interface OutletContextType {
  openAddToPlaylist: (song: SongView) => void;
}

export const MoodDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { playSong, setActiveMood } = usePlayer();
  const { info } = useToast();
  const outletContext = useOutletContext<OutletContextType>();

  const [songs, setSongs] = useState<SongView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const moodKey = name ? name.toUpperCase() : 'HAPPY';
  const theme = getMoodTheme(moodKey);
  const isQuiet = isLowMood(moodKey);
  const shiftOptions = getShiftTargets(moodKey);

  const loadRecommendations = async () => {
    if (!name) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await moodService.getRecommendations(name);
      setSongs(data.songs);
      setActiveMood(moodKey);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [name]);

  const featuredSong = songs[0] || null;
  const companionSongs = songs.slice(1);

  return (
    <div className="space-y-12 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/moods')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Mood Explorer
      </button>

      {/* Hero Header */}
      <section
        className={`relative rounded-3xl p-8 md:p-12 border overflow-hidden transition-all bg-gradient-to-br ${theme.cardClasses}`}
        style={{
          boxShadow: `0 25px 60px -25px ${theme.primaryColor}30`,
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: theme.primaryColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-4xl">{theme.emoji}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.badgeClasses}`}>
                {isQuiet ? 'Reflective Wave' : 'Active Frequency'}
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight font-display">
              {theme.displayName}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              {theme.vibeTagline}. Handpicked sound waves to resonate with your soul.
            </p>
          </div>

          {songs.length > 0 && (
            <button
              onClick={() => playSong(songs[0], songs, moodKey)}
              className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              Flow Into {theme.displayName}
            </button>
          )}
        </div>
      </section>

      {/* If quiet/sad, offer immediate Shift The Vibe */}
      {isQuiet && (
        <section className="rounded-3xl p-6 sm:p-8 bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Feeling low? Shift the vibe forward
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            You don't have to stay here. Explore music designed to lift and energize your day:
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {shiftOptions.map((sh) => (
              <button
                key={sh.targetMood}
                onClick={() => {
                  navigate(`/moods/${sh.targetMood}`);
                  info(`Shifting vibe to ${sh.label}!`);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <span>{sh.emoji}</span>
                <span>{sh.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </section>
      )}

      {errorMessage && <ErrorState message={errorMessage} onRetry={loadRecommendations} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 space-y-3">
          <p className="text-base font-semibold text-slate-300">Your flow is waiting.</p>
          <p className="text-xs text-slate-500">No tracks currently matched to this exact frequency.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Spotlight Track */}
          {featuredSong && (
            <FeaturedFlowCard
              song={featuredSong}
              moodName={moodKey}
              playlistContext={songs}
              onAddToPlaylist={outletContext?.openAddToPlaylist}
            />
          )}

          {/* Sound Path Stream */}
          {companionSongs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                More in this Flow
              </h3>
              <div className="space-y-1.5">
                {companionSongs.map((song, idx) => (
                  <SoundPathRow
                    key={song.id}
                    index={idx}
                    song={song}
                    playlistContext={songs}
                    onAddToPlaylist={outletContext?.openAddToPlaylist}
                    activeMood={moodKey}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
