import React, { useEffect, useState } from 'react';
import { ArrowRight, BookHeart, Compass, Map, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { moodService } from '../services/moodService';
import type { SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/common/SongCard';

const contexts = [
  ['Find something new', 'DREAMY', Compass],
  ['Take me somewhere', 'CALM', Map],
  ['Remember a feeling', 'NOSTALGIC', BookHeart],
] as const;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveMood } = usePlayer();
  const [songs, setSongs] = useState<SongView[]>([]);
  const [intent, setIntent] = useState('');
  const [selectedMood, setSelectedMood] = useState('CALM');

  useEffect(() => {
    moodService.getRecommendations(selectedMood)
      .then((result) => setSongs(result.songs.slice(0, 3)))
      .catch(() => setSongs([]));
  }, [selectedMood]);

  const choose = (label: string, mood: string) => {
    setIntent(label);
    setSelectedMood(mood);
    setActiveMood(mood);
  };

  const openDiscovery = () => {
    if (intent.trim()) navigate(`/discover?q=${encodeURIComponent(intent.trim())}`);
    else navigate('/discover');
  };

  return (
    <div className="space-y-24 pb-12">
      <section className="max-w-3xl space-y-6">
        <p className="eyebrow">Moodiflo</p>
        <h1 className="page-title">What do you want music to feel like?</h1>
        <p className="page-copy">Choose a direction, then let the music begin.</p>
        <div className="panel flex items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-[#8D86D9]" />
          <input
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') openDiscovery(); }}
            placeholder="I feel tired but don't want sad music..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#737B95]"
          />
          <button aria-label="Explore this feeling" onClick={openDiscovery} className="text-[#D9B56D]">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="eyebrow">Start here</p>
          <h2 className="section-title mt-2">Choose a direction</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {contexts.map(([label, mood, Icon]) => (
            <button key={label} onClick={() => choose(label, mood)} className="panel-quiet panel-hover p-5 text-left">
              <Icon className="mb-12 h-5 w-5 text-[#A7ABC0]" />
              <span className="block text-sm font-semibold text-[#EDEAF7]">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">A first listen</p>
            <h2 className="section-title mt-2">{intent || 'Quiet focus'}</h2>
          </div>
          <button onClick={() => navigate('/discover')} className="button-link shrink-0">Discover <ArrowRight className="h-4 w-4" /></button>
        </div>
        {songs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {songs.map((song) => <SongCard key={song.id} song={song} playlistContext={songs} />)}
          </div>
        ) : (
          <p className="panel-quiet p-8 text-sm text-[#A7ABC0]">No tracks are available yet.</p>
        )}
      </section>
    </div>
  );
};
