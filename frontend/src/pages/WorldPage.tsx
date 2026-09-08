import React, { useEffect, useState } from 'react';
import { ArrowRight, Globe2, Play, Waves } from 'lucide-react';
import { songService } from '../services/songService';
import { usePlayer } from '../hooks/usePlayer';
import type { SongView } from '../types';

const regions = [
  ['Delhi', 'Hindi · Punjabi', 'Folk · indie · contemporary fusion'],
  ['Rajasthan', 'Marwari · Hindi', 'Folk · desert blues · strings'],
  ['Goa', 'Konkani · English', 'Electronic · coastal · jazz'],
  ['São Paulo', 'Portuguese', 'MPB · samba · rhythmic pop'],
  ['Lagos', 'English · Yoruba', 'Afrobeats · highlife · alté'],
  ['Jakarta', 'Indonesian', 'Indie · gamelan · dream pop'],
];

export const WorldPage: React.FC = () => {
  const [songs, setSongs] = useState<SongView[]>([]);
  const [selected, setSelected] = useState(0);
  const { playSong } = usePlayer();
  useEffect(() => { songService.getAllSongs(0, 20).then((page) => setSongs(page.content)).catch(() => {}); }, []);
  const region = regions[selected];
  return <div className="space-y-10"><header><p className="eyebrow text-[#63B7AE]">Sargam · world of sound</p><h1 className="page-title">Travel through<br className="hidden sm:block" /> music, not maps.</h1><p className="page-copy">A living route of rhythm, language, and musical memory. Follow a sound from one place into another.</p></header><section className="world-canvas"><div className="world-route" aria-hidden="true" />{regions.map(([name], index) => <button key={name} onClick={() => setSelected(index)} className={`region-node ${selected === index ? 'text-[#D9B56D]' : ''}`} aria-label={`Explore ${name}`}><span>{name}</span></button>)}<div className="absolute bottom-5 left-5 max-w-xs sm:bottom-8 sm:left-8"><p className="text-xs uppercase tracking-[0.18em] text-[#63B7AE]">A route through sound</p><h2 className="mt-2 text-2xl font-semibold text-white">{region[0]} → somewhere unexpected</h2><p className="mt-2 text-xs leading-5 text-[#A7ABC0]">Select a point to open its musical character and the next connection.</p></div><div className="absolute right-5 top-5 rounded-full border border-white/10 bg-[#0B1020]/60 p-3 text-[#63B7AE]"><Globe2 className="h-5 w-5" /></div></section><section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]"><div className="panel p-6"><p className="eyebrow text-[#63B7AE]">Now arriving</p><h2 className="mt-3 text-3xl font-semibold text-white">{region[0]}</h2><p className="mt-2 text-sm text-[#63B7AE]">{region[1]}</p><p className="mt-4 text-sm leading-7 text-[#A7ABC0]">{region[2]}. A local starting point that can lead to a distant rhythmic character.</p><button onClick={() => songs.length && playSong(songs[selected % songs.length], songs)} className="button-primary mt-7"><Play className="h-4 w-4 fill-current" /> Start journey</button></div><div className="panel-quiet p-6"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-[#63B7AE]">Connection</p><h2 className="mt-2 text-xl font-semibold text-white">{region[0]} shares a pulse with São Paulo</h2></div><Waves className="h-5 w-5 text-[#D9B56D]" /></div><p className="max-w-xl text-sm leading-7 text-[#A7ABC0]">You liked this region's rhythmic character. Follow the line to artists in another language who make movement feel familiar in a new place.</p><button onClick={() => setSelected((selected + 1) % regions.length)} className="button-link mt-6">Follow the connection <ArrowRight className="h-4 w-4" /></button></div></section></div>;
};
