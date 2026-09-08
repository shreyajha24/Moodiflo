import React, { useEffect, useState } from 'react';
import { Play, SlidersHorizontal } from 'lucide-react';
import { moodService } from '../services/moodService';
import { usePlayer } from '../hooks/usePlayer';
import type { SongView } from '../types';

const stages = [['Begin', 'Calm'], ['Drift', 'Curious'], ['Discover', 'Open'], ['Rise', 'Energetic'], ['Arrive', 'Euphoric']];
export const JourneysPage: React.FC = () => {
  const [songs, setSongs] = useState<SongView[]>([]);
  const { playSong } = usePlayer();
  useEffect(() => {
    Promise.all(['CALM', 'DREAMY', 'FOCUS', 'ENERGETIC', 'PARTY'].map((mood) => moodService.getRecommendations(mood, 0, 1)))
      .then((pages) => setSongs(pages.flatMap((page) => page.songs)))
      .catch(() => setSongs([]));
  }, []);
  return <div className="space-y-10"><header><p className="eyebrow text-[#D97870]">Music in motion</p><h1 className="page-title">A journey from<br className="hidden sm:block" /> calm to euphoric.</h1><p className="page-copy">Move through changing moods, with a real Spotify track at every stage.</p></header><section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] p-6 sm:p-8"><div><p className="eyebrow text-[#D97870]">Tonight's route</p><h2 className="mt-2 text-3xl font-semibold text-white">Calm → Euphoric</h2></div><button className="button-quiet"><SlidersHorizontal className="h-4 w-4" /> Shape journey</button></div><div className="journey-path">{stages.map(([name, mood], index) => <article key={name} className="journey-stage"><div className="journey-stage-dot" /><div className="journey-stage-art artwork">{songs[index]?.coverImageUrl ? <img src={songs[index].coverImageUrl} alt="" /> : null}</div><div className="journey-stage-copy"><p className="text-[10px] uppercase tracking-widest text-[#A7ABC0]">{name}</p><h3 className="mt-1 text-base font-semibold text-white">{mood}</h3>{songs[index] && <p className="mt-1 truncate text-xs text-[#737B95]">{songs[index].title} · {songs[index].artist}</p>}</div></article>)}</div><div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8"><p className="text-sm text-[#A7ABC0]">Each stage changes the next.</p><button onClick={() => songs.length && playSong(songs[0], songs)} className="button-primary"><Play className="h-4 w-4 fill-current" /> Begin journey</button></div></section></div>;
};
