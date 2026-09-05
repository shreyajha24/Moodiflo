import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListMusic, Plus, Music, Loader2, ArrowRight } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import type { PlaylistView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

export const PlaylistsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [playlists, setPlaylists] = useState<PlaylistView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const loadPlaylists = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await playlistService.getAllPlaylists();
      setPlaylists(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [isAuthenticated]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const newPl = await playlistService.createPlaylist({
        name: name.trim(),
        description: description.trim(),
      });
      setPlaylists((prev) => [newPl, ...prev]);
      setShowCreateModal(false);
      setName('');
      setDescription('');
      success(`Created playlist "${newPl.name}"!`);
      navigate(`/playlists/${newPl.id}`);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={ListMusic}
        title="Organize With Playlists"
        description="Sign in to curate your personal track collections and customize mood sessions."
        actionText="Log In"
        onAction={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ListMusic className="w-8 h-8 text-emerald-400" />
            My Playlists
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create and manage customized tracklists
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {errorMessage && <ErrorState message={errorMessage} onRetry={loadPlaylists} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists created yet"
          description="Build your first custom playlist to group your favorite songs together."
          actionText="Create Playlist"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => navigate(`/playlists/${pl.id}`)}
              className="group glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between h-52 cursor-pointer border border-white/5 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Music className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {pl.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {pl.description || 'No description provided'}
                </p>
                <p className="text-[11px] font-semibold text-emerald-400 mt-3">
                  {pl.songs?.length || 0} {pl.songs?.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#12141f] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">New Playlist</h3>
            <p className="text-xs text-slate-400 mb-5">
              Give your playlist a title and optional description.
            </p>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late Night Beats"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="What is the vibe of this playlist?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Playlist'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
