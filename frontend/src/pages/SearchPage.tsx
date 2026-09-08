import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Music2 } from 'lucide-react';
import { spotifyService } from '../services/spotifyService';
import type { SongView } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { SongCard } from '../components/common/SongCard';
import { SongCardSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

const QUICK_TAGS = ['Pop', 'Rock', 'Happy', 'Calm', 'Dance', 'Hindi', 'Acoustic', 'Love'];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  const [results, setResults] = useState<SongView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery.trim());
      setSearchParams({ q: debouncedQuery.trim() }, { replace: true });
    } else {
      setResults([]);
      setHasSearched(false);
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery]);

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);
    try {
      setResults(await spotifyService.search(searchTerm, 0, 30));
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-white">Search Music</h1>
        <p className="text-xs md:text-sm text-slate-400">
          Find tracks by song title, artist, album, genre, or mood keyword
        </p>

        {/* Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a song title, artist, or vibe..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-base text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 shadow-xl transition-all"
            autoFocus
          />
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {errorMessage && (
        <ErrorState message={errorMessage} onRetry={() => performSearch(debouncedQuery)} />
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
        </div>
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No tracks found"
          description={`We couldn't find any songs matching "${debouncedQuery}". Try another keyword or explore moods.`}
        />
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Found {results.length} results for "{debouncedQuery}"</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {results.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={results}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500 text-xs">
          Start typing above to search songs, artists, and moods.
        </div>
      )}
    </div>
  );
};
