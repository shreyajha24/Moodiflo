import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { homeService } from '../services/homeService';
import { moodService } from '../services/moodService';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/common/SongCard';
import type { DiscoveryResponse, SongView } from '../types';

const MOODS = ['Happy', 'Calm', 'Sad', 'Energetic', 'Romantic', 'Focus', 'Chill', 'Melancholic', 'Nostalgic', 'Dreamy'];
const SHIFT_PATH = ['CALM', 'HAPPY', 'ENERGETIC'] as const;

const Rail: React.FC<{ title: string; songs: SongView[]; onSeeAll?: () => void }> = ({ title, songs, onSeeAll }) => {
  if (!songs.length) return null;
  return (
    <section className="music-rail-section">
      <div className="section-heading">
        <h2 className="section-title">{title}</h2>
        {onSeeAll && <button className="button-link" onClick={onSeeAll}>See all <ArrowRight size={14} /></button>}
      </div>
      <div className="music-rail">{songs.slice(0, 8).map((song) => <SongCard key={`${title}-${song.id}`} song={song} playlistContext={songs} />)}</div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveMood } = usePlayer();
  const [selectedMood, setSelectedMood] = useState('CALM');
  const [songs, setSongs] = useState<SongView[]>([]);
  const [feed, setFeed] = useState<DiscoveryResponse | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const shiftIndex = SHIFT_PATH.indexOf(selectedMood as typeof SHIFT_PATH[number]);
  const moodLabel = useMemo(() => selectedMood.charAt(0) + selectedMood.slice(1).toLowerCase(), [selectedMood]);

  useEffect(() => {
    document.documentElement.dataset.mood = selectedMood;
    setLoading(true);
    moodService.getRecommendations(selectedMood, 0, 12)
      .then((result) => setSongs(result.songs))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [selectedMood]);

  useEffect(() => {
    homeService.getHomeFeed().then(setFeed).catch(() => setFeed(null));
  }, []);

  const chooseMood = (mood: string) => {
    const value = mood.toUpperCase();
    setSelectedMood(value);
    setActiveMood(value);
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const shift = (direction: -1 | 1) => {
    const next = Math.max(0, Math.min(SHIFT_PATH.length - 1, (shiftIndex < 0 ? 0 : shiftIndex) + direction));
    chooseMood(SHIFT_PATH[next]);
  };

  return (
    <div className="home-world">
      <section className="home-hero mood-hero">
        <div>
          <p className="eyebrow">Mood canvas · feel the shift</p>
          <h1 className="page-title">Shift your mood.<br /><span className="gradient-text">Discover the sound.</span></h1>
          <p className="page-copy">Pick a feeling and let the next track find its way to you.</p>
        </div>
        <form onSubmit={submitSearch} className="home-search panel-quiet">
          <Search size={16} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Spotify" aria-label="Search Spotify" />
          <button aria-label="Search"><ArrowRight size={16} /></button>
        </form>
      </section>

      <section className="mood-selector">
        <div className="section-heading"><div><p className="eyebrow">What are you feeling?</p><h2 className="section-title">Choose a direction</h2></div><Sparkles size={18} className="text-cyan-300" /></div>
        <div className="mood-segments mood-scroll">{MOODS.map((mood) => <button key={mood} className={`mood-chip ${selectedMood === mood.toUpperCase() ? 'is-active' : ''}`} onClick={() => chooseMood(mood)}>{mood}</button>)}</div>
        <div className="mood-shifter">
          <div className="mood-shifter-label"><span>Move the atmosphere</span><strong>{moodLabel}</strong></div>
          <button className="icon-button" onClick={() => shift(-1)} disabled={shiftIndex <= 0} aria-label="Previous mood"><ChevronLeft size={16} /></button>
          <div className="mood-shifter-line"><span style={{ width: `${((Math.max(shiftIndex, 0)) / (SHIFT_PATH.length - 1)) * 100}%` }} /><i /></div>
          <button className="icon-button" onClick={() => shift(1)} disabled={shiftIndex >= SHIFT_PATH.length - 1} aria-label="Next mood"><ChevronRight size={16} /></button>
        </div>
      </section>

      <Rail title={`Made for your ${moodLabel.toLowerCase()} mood`} songs={songs} onSeeAll={() => navigate('/search')} />
      <Rail title="Recently explored" songs={feed?.recentlyPlayed || feed?.continueListening || []} onSeeAll={() => navigate('/history')} />
      <Rail title="New discoveries" songs={feed?.recommendedForYou || feed?.trending || []} onSeeAll={() => navigate('/discover')} />

      {!loading && !songs.length && !feed?.recentlyPlayed?.length && <div className="empty-inline panel-quiet">No music found for this mood yet. Try another mood or search Spotify.</div>}
      {loading && <div className="rail-loading"><span /><span /><span /><span /></div>}
    </div>
  );
};
