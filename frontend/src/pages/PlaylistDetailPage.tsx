import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Trash2,
  Music,
  Loader2,
  Plus,
} from 'lucide-react';
import { playlistService } from '../services/playlistService';
import type { PlaylistView } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { useToast } from '../hooks/useToast';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { success, error } = useToast();

  const [playlist, setPlaylist] = useState<PlaylistView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const playlistId = Number(id);

  const loadPlaylist = async () => {
    if (!playlistId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await playlistService.getPlaylist(playlistId);
      setPlaylist(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const handleRemoveSong = async (songId: number) => {
    if (!playlist) return;
    try {
      await playlistService.removeSong(playlist.id, songId);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              songs: prev.songs.filter((s) => s.id !== songId),
            }
          : null
      );
      success('Removed track from playlist');
    } catch {
      error('Failed to remove track');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    if (!window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) return;

    setIsDeleting(true);
    try {
      await playlistService.deletePlaylist(playlist.id);
      success('Playlist deleted');
      navigate('/playlists');
    } catch {
      error('Failed to delete playlist');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (errorMessage || !playlist) {
    return <ErrorState message={errorMessage || 'Playlist not found'} onRetry={loadPlaylist} />;
  }

  const songs = playlist.songs || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/playlists')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Playlists
      </button>

      {/* Playlist Hero */}
      <section className="glass-panel rounded-3xl p-6 md:p-10 border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-6 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-950">
        <div className="w-48 h-48 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xl shrink-0">
          <Music className="w-16 h-16" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Playlist
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {playlist.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            {playlist.description || 'Curated personal playlist.'}
          </p>
          <p className="text-xs text-slate-500">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            {songs.length > 0 && (
              <button
                onClick={() => playSong(songs[0], songs, playlist.name)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Play All
              </button>
            )}

            <button
              onClick={() => navigate('/songs')}
              className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add More Songs
            </button>

            <button
              onClick={handleDeletePlaylist}
              disabled={isDeleting}
              className="p-3 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Songs List */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-white px-2">Tracks</h3>

        {songs.length === 0 ? (
          <EmptyState
            icon={Music}
            title="Playlist is empty"
            description="Browse all songs and click '+ Add to Playlist' to start building this collection."
            actionText="Browse Songs"
            onAction={() => navigate('/songs')}
          />
        ) : (
          <div className="space-y-1.5">
            {songs.map((s, index) => {
              const isThisPlaying = currentSong?.id === s.id && isPlaying;
              return (
                <div
                  key={s.id}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer"
                  onClick={() => {
                    if (currentSong?.id === s.id) {
                      togglePlay();
                    } else {
                      playSong(s, songs, playlist.name);
                    }
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <span className="w-6 text-center text-xs font-mono text-slate-500">
                      {isThisPlaying ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {s.coverImageUrl ? (
                        <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <div className="truncate">
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{s.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                      {s.duration ? `${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, '0')}` : ''}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSong(s.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
