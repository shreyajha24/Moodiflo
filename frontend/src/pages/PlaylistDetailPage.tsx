import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Music,
  Loader2,
  Plus,
  Waves,
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
      success('Track removed from playlist');
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    if (!window.confirm(`Delete playlist "${playlist.name}"?`)) return;

    setIsDeleting(true);
    try {
      await playlistService.deletePlaylist(playlist.id);
      success(`Playlist deleted`);
      navigate('/playlists');
    } catch (err) {
      error(getErrorMessage(err));
      setIsDeleting(false);
    }
  };

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={loadPlaylist} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <EmptyState
        icon={Music}
        title="Playlist Not Found"
        description="The sound collection you are searching for does not exist."
        actionText="Back to Playlists"
        onAction={() => navigate('/playlists')}
      />
    );
  }

  const songs = playlist.songs || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/playlists')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Playlists
      </button>

      {/* Playlist Hero */}
      <section className="rounded-3xl p-6 md:p-10 border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-6 bg-gradient-to-br from-cyan-500/15 via-white/[0.02] to-rose-500/10 shadow-2xl">
        <div className="w-44 h-44 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shadow-2xl shrink-0">
          <Waves className="w-16 h-16" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            Curated Flow
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight font-display">
            {playlist.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            {playlist.description || 'Personal soundscape.'}
          </p>
          <p className="text-xs text-slate-500">
            {songs.length} {songs.length === 1 ? 'track' : 'tracks'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            {songs.length > 0 && (
              <button
                onClick={() => playSong(songs[0], songs, playlist.name)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-rose-500 hover:opacity-90 text-slate-950 font-black text-xs shadow-lg shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Flow All
              </button>
            )}

            <button
              onClick={() => navigate('/songs')}
              className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add More Tracks
            </button>

            <button
              onClick={handleDeletePlaylist}
              disabled={isDeleting}
              className="p-3 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Songs List */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-white px-2 font-display">Tracks in this Stream</h3>

        {songs.length === 0 ? (
          <EmptyState
            icon={Music}
            title="This flow has no tracks yet"
            description="Explore the sound vault and click '+' on any track to start building this collection."
            actionText="Browse Tracks"
            onAction={() => navigate('/songs')}
          />
        ) : (
          <div className="space-y-1.5">
            {songs.map((s, index) => {
              const isThisPlaying = currentSong?.id === s.id && isPlaying;
              return (
                <div
                  key={s.id}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer"
                  onClick={() => {
                    if (isThisPlaying) {
                      togglePlay();
                    } else {
                      playSong(s, songs, playlist.name);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center font-mono text-xs text-slate-500">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10 relative">
                      {s.coverImageUrl ? (
                        <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Music className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {isThisPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-bold truncate ${isThisPlaying ? 'text-cyan-300' : 'text-white'}`}>
                        {s.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{s.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSong(s.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
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
