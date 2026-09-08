import React, { useEffect, useState } from 'react';
import { BookHeart, MapPin, Save } from 'lucide-react';
import { historyService } from '../services/historyService';
import type { SongView } from '../types';

type Memory = { song: string; artist: string; note: string; date: string; location: string };
const storageKey = 'moodify_memories';

export const DiaryPage: React.FC = () => {
  const [history, setHistory] = useState<SongView[]>([]);
  const [memories, setMemories] = useState<Memory[]>(() => JSON.parse(localStorage.getItem(storageKey) || '[]') as Memory[]);
  const [selected, setSelected] = useState<SongView | null>(null);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => { historyService.getHistory().then(setHistory).catch(() => {}); }, []);

  const save = () => {
    if (!selected || !note.trim()) return;
    const next = [{
      song: selected.title,
      artist: selected.artist,
      note: note.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      location: location.trim(),
    }, ...memories];
    setMemories(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setNote('');
    setLocation('');
    setSelected(null);
  };

  return (
    <div className="space-y-16 pb-12">
      <header className="max-w-2xl space-y-4">
        <p className="eyebrow text-[#D9B56D]">Diary</p>
        <h1 className="page-title">Keep the moments that matter.</h1>
        <p className="page-copy">Choose a song from your history and leave a note.</p>
      </header>
      <section className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <BookHeart className="h-5 w-5 text-[#D9B56D]" />
            <h2 className="section-title">Recent listening</h2>
          </div>
          {history.length ? (
            <div className="panel-quiet divide-y divide-white/[0.08] p-2">
              {history.slice(0, 5).map((song) => (
                <button key={song.id} onClick={() => setSelected(song)} className={`track-row w-full text-left ${selected?.id === song.id ? 'bg-[#D9B56D]/10' : ''}`}>
                  <div className="artwork h-10 w-10 shrink-0 rounded-md">{song.coverImageUrl && <img src={song.coverImageUrl} alt="" />}</div>
                  <span className="track-row-copy">
                    <span className="track-row-title">{song.title}</span>
                    <span className="track-row-meta">{song.artist}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : <p className="text-sm text-[#A7ABC0]">Play a song to begin.</p>}
          {selected && (
            <div className="panel space-y-4 p-5">
              <p className="text-sm text-[#D9B56D]">{selected.title}</p>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write a note..." className="form-textarea" />
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#A7ABC0]" />
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Place (optional)" className="form-input" />
              </div>
              <button onClick={save} className="button-primary"><Save className="h-4 w-4" /> Save</button>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <h2 className="section-title">Saved moments</h2>
          {memories.length ? (
            <div className="memory-timeline">
              {memories.map((memory, index) => (
                <article key={`${memory.date}-${index}`} className="memory-point panel-quiet p-5">
                  <p className="text-xs font-semibold text-[#D9B56D]">{memory.date}</p>
                  <h3 className="mt-2 text-base font-semibold text-white">{memory.song}</h3>
                  <p className="mt-1 text-xs text-[#A7ABC0]">{memory.artist}</p>
                  <p className="mt-4 text-sm leading-6 text-[#A7ABC0]">“{memory.note}”</p>
                  {memory.location && <p className="mt-3 flex items-center gap-1 text-xs text-[#737B95]"><MapPin className="h-3.5 w-3.5" />{memory.location}</p>}
                </article>
              ))}
            </div>
          ) : <p className="text-sm text-[#A7ABC0]">Your saved moments will appear here.</p>}
        </div>
      </section>
    </div>
  );
};
