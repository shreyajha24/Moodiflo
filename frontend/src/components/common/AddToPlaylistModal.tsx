import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Loader2, Music } from 'lucide-react';
import type { PlaylistView, SongView } from '../../types';
import { playlistService } from '../../services/playlistService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

interface AddToPlaylistModalProps {
  song: SongView | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ song, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const [playlists, setPlaylists] = useState<PlaylistView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadPlaylists();
    }
  }, [isOpen, isAuthenticated]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await playlistService.getAllPlaylists();
      setPlaylists(data);
      // check which playlists already have this song
      if (song) {
        const map: Record<number, boolean> = {};
        data.forEach((pl) => {
          if (pl.songs?.some((s) => s.id === song.id)) {
            map[pl.id] = true;
          }
        });
        setAddedMap(map);
      }
    } catch {
      error('Failed to load your playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSong = async (playlistId: number) => {
    if (!song) return;
    try {
      await playlistService.addSong(playlistId, song.id);
      setAddedMap((prev) => ({ ...prev, [playlistId]: true }));
      success(`Added "${song.title}" to playlist`);
    } catch {
      error('Failed to add song to playlist');
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song || !newPlaylistName.trim()) return;

    try {
      const newPl = await playlistService.createPlaylist({
        name: newPlaylistName.trim(),
        description: 'Created from song card',
      });
      await playlistService.addSong(newPl.id, song.id);
      setPlaylists((prev) => [newPl, ...prev]);
      setAddedMap((prev) => ({ ...prev, [newPl.id]: true }));
      setNewPlaylistName('');
      setIsCreating(false);
      success(`Created playlist "${newPl.name}" and added song!`);
    } catch {
      error('Failed to create playlist');
    }
  };

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12141f] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Add to Playlist</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">{song.title} • {song.artist}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create new playlist toggle */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full mb-4 py-2.5 px-4 rounded-xl border border-dashed border-violet-500/40 hover:border-violet-400 bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Playlist
          </button>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
            <input
              type="text"
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-4 py-1.5 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                Create & Add
              </button>
            </div>
          </form>
        )}

        {/* Existing Playlists List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <Music className="w-8 h-8 mx-auto mb-2 stroke-1 text-slate-600" />
              You haven't created any playlists yet.
            </div>
          ) : (
            playlists.map((pl) => {
              const isAdded = !!addedMap[pl.id];
              return (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  <div className="truncate pr-2">
                    <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {pl.songs?.length || 0} tracks
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddSong(pl.id)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isAdded
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-violet-600 text-white hover:bg-violet-500'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
