import React, { useEffect, useMemo, useState } from 'react';
import { BookHeart, MapPin, Pencil, Play, Save, Search, X } from 'lucide-react';
import { historyService } from '../services/historyService';
import { usePlayer } from '../hooks/usePlayer';
import type { SongView } from '../types';

type Memory = { songId: number; song: string; artist: string; note: string; date: string; location: string; coverImageUrl?: string | null };
const STORAGE_KEY = 'moodify_memories';

export const DiaryPage: React.FC = () => {
  const { playSong } = usePlayer();
  const [history, setHistory] = useState<SongView[]>([]);
  const [memories, setMemories] = useState<Memory[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Memory[]; } catch { return []; }
  });
  const [selected, setSelected] = useState<SongView | null>(null);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<number | null>(null);

  useEffect(() => { historyService.getHistory().then(setHistory).catch(() => setHistory([])); }, []);
  const filteredHistory = useMemo(() => history.filter((song) => `${song.title} ${song.artist}`.toLowerCase().includes(search.toLowerCase())), [history, search]);

  const selectSong = (song: SongView) => { setSelected(song); setEditing(null); setNote(''); setLocation(''); };
  const editMemory = (memory: Memory) => {
    const song = history.find((item) => item.id === memory.songId);
    if (!song) return;
    setSelected(song); setNote(memory.note); setLocation(memory.location); setEditing(memory.songId);
  };
  const save = () => {
    if (!selected || !note.trim()) return;
    const nextMemory: Memory = { songId: selected.id, song: selected.title, artist: selected.artist, note: note.trim(), date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), location: location.trim(), coverImageUrl: selected.coverImageUrl };
    const next = editing === null ? [nextMemory, ...memories] : memories.map((item) => item.songId === editing ? { ...item, note: nextMemory.note, location: nextMemory.location } : item);
    setMemories(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setSelected(null); setNote(''); setLocation(''); setEditing(null);
  };

  return (
    <div className="diary-page">
      <header className="diary-heading"><div><p className="eyebrow">Diary · remember the music</p><h1 className="page-title">Keep what the music meant.</h1><p className="page-copy">Save a note beside a song from your listening history.</p></div><BookHeart className="diary-heading-icon" /></header>
      <div className="diary-layout">
        <section className="diary-compose">
          <div className="section-heading"><div><p className="eyebrow">Listening history</p><h2 className="section-title">Choose a moment</h2></div></div>
          <label className="diary-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a song" /></label>
          {filteredHistory.length ? <div className="diary-history">{filteredHistory.slice(0, 12).map((song) => <button key={song.id} className={`diary-song ${selected?.id === song.id ? 'is-selected' : ''}`} onClick={() => selectSong(song)}><div className="artwork">{song.coverImageUrl && <img src={song.coverImageUrl} alt="" />}</div><span><strong>{song.title}</strong><small>{song.artist}</small></span><Play size={14} /></button>)}</div> : <p className="empty-copy">Play something to begin your diary.</p>}
          {selected && <div className="diary-editor"><div className="editor-song"><strong>{selected.title}</strong><small>{selected.artist}</small></div><textarea className="form-textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="What do you want to remember?" /><div className="diary-location form-input"><MapPin size={15} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Place (optional)" /></div><div className="editor-actions"><button className="button-quiet" onClick={() => playSong(selected)}><Play size={14} /> Play</button><button className="button-primary" onClick={save}><Save size={14} /> {editing === null ? 'Save memory' : 'Update memory'}</button><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close editor"><X size={15} /></button></div></div>}
        </section>
        <section className="diary-entries"><div className="section-heading"><div><p className="eyebrow">Your archive</p><h2 className="section-title">Songs worth keeping</h2></div><span className="entry-count">{memories.length} saved</span></div>{memories.length ? <div className="memory-timeline">{memories.map((memory) => <article key={`${memory.songId}-${memory.date}`} className="memory-point panel-quiet"><div className="memory-head">{memory.coverImageUrl && <div className="artwork memory-art"><img src={memory.coverImageUrl} alt="" /></div>}<div><span>{memory.date}</span><h3>{memory.song}</h3><p>{memory.artist}</p></div><button className="icon-button" onClick={() => editMemory(memory)} aria-label={`Edit note for ${memory.song}`}><Pencil size={14} /></button></div><p className="memory-note">“{memory.note}”</p>{memory.location && <p className="memory-location"><MapPin size={13} /> {memory.location}</p>}</article>)}</div> : <div className="empty-inline panel-quiet">Your saved moments will appear here.</div>}</section>
      </div>
    </div>
  );
};
