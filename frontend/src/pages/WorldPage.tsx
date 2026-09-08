import React, { useEffect, useState } from 'react';
import { Globe2, MapPin, Play } from 'lucide-react';
import { songService } from '../services/songService';
import { usePlayer } from '../hooks/usePlayer';
import type { SongView } from '../types';

const regions = [['India', 'Indie, folk, Hindustani', 'Hindi · Malayalam'], ['Japan', 'City pop, ambient, folk', 'Japanese · English'], ['Brazil', 'Samba, MPB, bossa nova', 'Portuguese'], ['Nigeria', 'Afrobeats, highlife, alté', 'English · Yoruba'], ['Mexico', 'Bolero, cumbia, indie', 'Spanish'], ['Indonesia', 'Gamelan, pop, indie', 'Indonesian']];
export const WorldPage: React.FC = () => {
  const [songs, setSongs] = useState<SongView[]>([]);
  const { playSong } = usePlayer();
  useEffect(() => { songService.getAllSongs(0, 20).then((page) => setSongs(page.content)).catch(() => {}); }, []);
  return <div className="space-y-10"><header><p className="eyebrow text-[#70D6D0]">Cultural exploration</p><h1 className="page-title">Explore the World</h1><p className="page-copy">Follow musical connections between places, languages, and rhythmic ideas — no country is an island.</p></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{regions.map(([name, genres, languages], index) => <article key={name} className="vibe-card rounded-2xl p-6"><div className="mb-8 flex items-center justify-between"><Globe2 className="h-6 w-6 text-[#70D6D0]" /><span className="text-xs text-[#A9ACC1]">0{index + 1}</span></div><h2 className="text-2xl font-bold text-white">{name}</h2><p className="mt-2 text-sm text-[#70D6D0]">{genres}</p><p className="mt-1 text-xs text-[#A9ACC1]">{languages}</p><button onClick={() => songs.length && playSong(songs[index % songs.length], songs)} className="mt-6 flex items-center gap-2 text-sm font-bold text-[#F5C76A]"><Play className="h-4 w-4" /> Start journey</button></article>)}</div><div className="rounded-2xl border border-[#70D6D0]/20 bg-[#70D6D0]/[0.06] p-5 text-sm text-[#c9fffb]"><MapPin className="mr-2 inline h-4 w-4" />You liked an Indian indie track? Try Brazilian artists with a similar rhythmic character. Connections are based on genre and language overlap in the local catalogue.</div></div>;
};
