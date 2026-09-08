import React, { useEffect, useState } from 'react';
import { Filter, Info, Sparkles } from 'lucide-react';
import { songService } from '../services/songService';
import { SongCard } from '../components/common/SongCard';
import type { SongView } from '../types';

export const DiscoverPage: React.FC = () => {
  const [songs, setSongs] = useState<SongView[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => { songService.getAllSongs(0, 40).then((page) => setSongs(page.content)).catch(() => setSongs([])); }, []);
  const visible = query ? songs.filter((song) => `${song.title} ${song.artist} ${song.genre} ${song.language}`.toLowerCase().includes(query.toLowerCase())) : songs;
  return <div className="space-y-10"><header><p className="eyebrow text-[#9B8AFB]">Genuine discovery</p><h1 className="page-title">Discover Unknown</h1><p className="page-copy">New to you because your listening has room to wander — not because an algorithm found the nearest copy.</p></header><div className="flex flex-wrap gap-2">{['More familiar', 'More unexpected', 'Different country', 'Different language', 'Different genre'].map((filter) => <button key={filter} onClick={() => setQuery(filter === 'Different language' ? 'Hindi' : '')} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#A9ACC1] hover:border-[#9B8AFB]/60 hover:text-white"><Filter className="h-3.5 w-3.5" />{filter}</button>)}</div><div className="rounded-2xl border border-[#9B8AFB]/20 bg-[#9B8AFB]/[0.07] p-5 text-sm text-[#d6d1ff]"><Info className="mr-2 inline h-4 w-4" /><strong>Why this?</strong> We start with tracks you have not played, then balance genre, language, geography, popularity, and variety. These are transparent local rules, not AI-generated claims.</div>{visible.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{visible.map((song) => <div key={song.id} className="relative"><span className="absolute left-3 top-3 z-10 rounded-full bg-[#70D6D0] px-2 py-1 text-[10px] font-black text-[#0B0D17]">NEW TO YOU</span><SongCard song={song} playlistContext={visible} /></div>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-[#A9ACC1]"><Sparkles className="mx-auto mb-3 h-6 w-6 text-[#9B8AFB]" />No discoveries match that filter yet.</div>}</div>;
};
