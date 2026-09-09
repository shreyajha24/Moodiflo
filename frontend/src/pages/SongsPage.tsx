import React, { useEffect, useState } from 'react';
import { Music4, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { songService } from '../services/songService';
import type { SongView, PageResponse } from '../types';
import { SongCard } from '../components/common/SongCard';
import { SongCardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

export const SongsPage: React.FC = () => {
  const [pageData, setPageData] = useState<PageResponse<SongView> | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');

  const loadSongs = async (page: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await songService.getAllSongs(page, 18);
      setPageData(data);
      setCurrentPage(page);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSongs(currentPage);
  }, []);

  // Filter songs locally by genre if user selects a genre filter
  const allGenres = Array.from(
    new Set(pageData?.content.map((s) => s.genre).filter(Boolean) as string[])
  );

  const displayedSongs = pageData?.content.filter((s) => {
    if (selectedGenre === 'ALL') return true;
    return s.genre?.toLowerCase() === selectedGenre.toLowerCase();
  }) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 font-display">
            <Music4 className="w-8 h-8 text-cyan-400" />
            Sound Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore tracks across all genres in the Moodiflo vault ({pageData?.totalElements || 0} total)
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Genres</option>
              {allGenres.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {errorMessage && <ErrorState message={errorMessage} onRetry={() => loadSongs(currentPage)} />}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array(12)
              .fill(0)
              .map((_, i) => <SongCardSkeleton key={i} />)
          : displayedSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={displayedSongs}
              />
            ))}
      </div>

      {/* Pagination Controls */}
      {pageData && pageData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/5">
          <button
            onClick={() => loadSongs(currentPage - 1)}
            disabled={currentPage === 0 || isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-slate-400">
            Page {currentPage + 1} of {pageData.totalPages}
          </span>
          <button
            onClick={() => loadSongs(currentPage + 1)}
            disabled={currentPage >= pageData.totalPages - 1 || isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
