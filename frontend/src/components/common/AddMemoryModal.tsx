import React, { useState, useEffect } from 'react';
import { BookHeart, MapPin, Music, Sparkles, X } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';
import { useToast } from '../../hooks/useToast';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const STORAGE_KEY = 'moodify_memories';

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { currentSong } = usePlayer();
  const { success, error } = useToast();

  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (currentSong) {
        setSongTitle(currentSong.title);
        setArtistName(currentSong.artist);
        setCoverUrl(currentSong.coverImageUrl || null);
      }
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(2)}`;
      setDate(formattedDate);
    }
  }, [isOpen, currentSong]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !note.trim()) {
      error('Please provide a song title and your reflection note.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newMemory = {
        song: songTitle.trim(),
        artist: artistName.trim() || 'Various Artists',
        note: note.trim(),
        date: date || new Date().toLocaleDateString('en-GB'),
        location: location.trim() || 'Listening Space',
        coverImageUrl: coverUrl,
      };

      const updated = [newMemory, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Notify window of update
      window.dispatchEvent(new CustomEvent('moodify-memory-added', { detail: newMemory }));

      success('Memory archived to your Diary!');
      setNote('');
      setLocation('');
      if (onSaved) onSaved();
      onClose();
    } catch {
      error('Failed to save memory.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/20 p-6 shadow-2xl backdrop-blur-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(20, 24, 44, 0.95) 0%, rgba(10, 14, 28, 0.98) 100%)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/30 border border-pink-500/30 text-pink-300">
              <BookHeart size={20} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-pink-400">Memory Archive</p>
              <h3 className="text-lg font-bold text-white">Save Music Moment</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Song Title</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-within:border-cyan-400">
                <Music size={14} className="text-cyan-400 shrink-0" />
                <input
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Song name"
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Artist</label>
              <input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Location Tag</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-within:border-emerald-400">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tokyo, Rainy train, Studio"
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date Stamp</label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD.MM/YY"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              What did this moment feel like?
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Listened to this while watching the rain outside the window..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-pink-400 placeholder:text-slate-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 hover:opacity-90 active:scale-95 transition-all"
            >
              <Sparkles size={15} />
              <span>Archive Memory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
