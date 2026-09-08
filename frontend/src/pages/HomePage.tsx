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
<<<<<<< HEAD
        <p className="page-copy">Move from sound to emotion, place, and memory. Moodiflo makes room for music you have not met yet.</p>
      </div>
      <div className="panel p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#A7ABC0]">Match this moment</p>
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Sparkles className="h-4 w-4 text-[#8D86D9]" />
          <input value={intent} onChange={(event) => setIntent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/discover?q=${encodeURIComponent(intent)}`); }} placeholder="I feel tired but don't want sad music..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#737B95]" />
          <button aria-label="Explore this feeling" onClick={() => navigate(`/discover?q=${encodeURIComponent(intent)}`)} className="text-[#D9B56D]"><ArrowRight className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#737B95]">A transparent context engine will shape a listening direction — no AI credentials required.</p>
      </div>
    </section>
    <section>
      <div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Choose a direction</p><h2 className="section-title mt-2">Music can take you somewhere.</h2></div><span className="hidden text-xs text-[#737B95] sm:block">Sound → movement → emotion → place → memory</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{contexts.map(([label, mood, Icon]) => <button key={label} onClick={() => choose(label, mood)} className="panel-quiet panel-hover p-4 text-left"><Icon className="mb-9 h-5 w-5 text-[#A7ABC0]" /><span className="block text-sm font-semibold text-[#EDEAF7]">{label}</span><span className="mt-2 block text-xs text-[#737B95]">Shape a {mood.toLowerCase()} listening space</span></button>)}</div>
    </section>
    <section className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="flex flex-col justify-between"><div><p className="eyebrow">A first movement</p><h2 className="section-title mt-2">{intent || 'Quiet focus'}</h2><p className="section-copy mt-3">Low-energy tracks, gentle transitions, and one or two unfamiliar voices. Not a playlist — a place to begin.</p></div><button onClick={() => navigate('/journeys')} className="button-link mt-6 w-fit">Shape a musical journey <ArrowRight className="h-4 w-4" /></button></div>
      {songs.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{songs.slice(0, 3).map((song) => <SongCard key={song.id} song={song} playlistContext={songs} />)}</div> : <div className="panel-quiet p-10 text-center text-sm text-[#A7ABC0]">No local tracks yet. Start with a journey.</div>}
    </section>
    {feed?.recentlyPlayed?.length ? <section><div className="mb-4 flex items-center justify-between"><h2 className="section-title">Recent echoes</h2><button onClick={() => navigate('/diary')} className="button-link">Open memory <ArrowRight className="h-4 w-4" /></button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{feed.recentlyPlayed.slice(0, 4).map((song) => <SongCard key={song.id} song={song} playlistContext={feed.recentlyPlayed} />)}</div></section> : null}
  </div>;
=======
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
>>>>>>> 883cd514840436824f835fb925a0a25d880252f0
};
