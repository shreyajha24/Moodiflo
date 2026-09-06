import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListMusic, Plus, Loader2, ArrowRight, Waves } from 'lucide-react';
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
        title="Your Sound Collections"
        description="Sign in to curate your personal playlists and custom mood journeys."
        actionText="Sign In"
        onAction={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 font-display">
            <ListMusic className="w-8 h-8 text-amber-400" />
            Curated Playlists
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personal track collections crafted for your daily rhythms
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {errorMessage && <ErrorState message={errorMessage} onRetry={loadPlaylists} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="Your flow is waiting"
          description="Build your first custom soundscape to group songs that resonate with your day."
          actionText="Create Playlist"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/playlists/${playlist.id}`)}
              className="group p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between h-48"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Waves className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {playlist.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {playlist.description || 'Custom playlist'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400 border-t border-white/5">
                <span>{playlist.songs?.length || 0} tracks</span>
                <span className="flex items-center gap-1 font-semibold group-hover:text-white transition-colors">
                  Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#131522] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-xl font-bold text-white font-display">Create New Playlist</h3>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Ambient Flow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="What is the mood of this playlist?"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !name.trim()}
                  className="px-6 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
