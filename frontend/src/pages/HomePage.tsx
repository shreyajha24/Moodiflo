import React, { useEffect, useState } from 'react';
import { ArrowRight, Compass, Headphones, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { homeService } from '../services/homeService';
import { moodService } from '../services/moodService';
import type { DiscoveryResponse, SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { SongCard } from '../components/common/SongCard';
import { ErrorState } from '../components/common/ErrorState';

const intents = [
  ['I need to focus', 'FOCUS'], ['I want something new', 'DREAMY'],
  ['I feel nostalgic', 'NOSTALGIC'], ['I want to feel lighter', 'HAPPY'],
  ['Late-night journey', 'CALM'], ['Surprise me', 'ENERGETIC'],
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveMood } = usePlayer();
  const [feed, setFeed] = useState<DiscoveryResponse | null>(null);
  const [songs, setSongs] = useState<SongView[]>([]);
  const [intent, setIntent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([homeService.getHomeFeed(), moodService.getRecommendations('CALM')])
      .then(([home, calm]) => { setFeed(home); setSongs(calm.songs); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load your listening room.'));
  }, []);

  const chooseIntent = (label: string, mood: string) => {
    setIntent(label);
    setActiveMood(mood);
    void moodService.getRecommendations(mood).then((result) => setSongs(result.songs)).catch(() => {});
  };

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  return (
    <div className="space-y-14 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#121525] px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#9B8AFB]/15 blur-3xl" />
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#9B8AFB]">Your listening room</p>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[#F5F3FF] sm:text-6xl">How do you want music to feel?</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A9ACC1]">A calm place for discovery, memory, and the next song you did not know you needed.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {intents.map(([label, mood]) => (
            <button key={label} onClick={() => chooseIntent(label, mood)} className={`rounded-full border px-4 py-2.5 text-sm transition ${intent === label ? 'border-[#FF7A73] bg-[#FF7A73]/15 text-[#F5F3FF]' : 'border-white/10 bg-white/[0.04] text-[#A9ACC1] hover:border-[#9B8AFB]/60 hover:text-white'}`}>{label}</button>
          ))}
        </div>
        <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-[#191D31] px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-[#F5C76A]" />
          <input value={intent} onChange={(event) => setIntent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/discover?q=${encodeURIComponent(intent)}`); }} placeholder="What are you in the mood for?" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#6f738a]" />
          <button aria-label="Explore listening intent" onClick={() => navigate(`/discover?q=${encodeURIComponent(intent)}`)} className="rounded-full bg-[#9B8AFB] p-2 text-[#0B0D17]"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#70D6D0]">A gentle beginning</p><h2 className="mt-2 text-3xl font-bold text-white">{intent || 'Quiet Focus'}</h2></div><button onClick={() => navigate('/discover')} className="flex items-center gap-2 text-sm text-[#9B8AFB]">Discover unknown <ArrowRight className="h-4 w-4" /></button></div>
        <p className="mb-6 max-w-2xl text-sm leading-6 text-[#A9ACC1]">Low-energy tracks, gentle transitions, and a few unfamiliar voices to keep the session comforting without staying predictable.</p>
        {songs.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{songs.slice(0, 5).map((song) => <SongCard key={song.id} song={song} playlistContext={songs} />)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-[#A9ACC1]">No local tracks yet. Start with a journey.</div>}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[['Discover Unknown', 'Songs beyond your usual orbit.', '/discover', Compass], ['Musical Journeys', 'A sequence that changes as you listen.', '/journeys', Headphones], ['Explore the World', 'Follow connections across cultures.', '/world', Sparkles]].map(([title, text, path, Icon]) => {
          const ActionIcon = Icon as typeof Compass;
          return <button key={title as string} onClick={() => navigate(path as string)} className="vibe-card rounded-2xl p-6 text-left"><ActionIcon className="mb-5 h-5 w-5 text-[#F5C76A]" /><h3 className="text-xl font-bold text-white">{title as string}</h3><p className="mt-2 text-sm text-[#A9ACC1]">{text as string}</p></button>;
        })}
      </section>
      {feed?.recentlyPlayed?.length ? <section><h2 className="mb-4 text-2xl font-bold text-white">Your recent listening</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{feed.recentlyPlayed.slice(0, 4).map((song) => <SongCard key={song.id} song={song} playlistContext={feed.recentlyPlayed} />)}</div></section> : null}
    </div>
  );
};
