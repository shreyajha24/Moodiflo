import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Music2, Search as SearchIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { spotifyService } from '../services/spotifyService';
import { useDebounce } from '../hooks/useDebounce';
import { SongCard } from '../components/common/SongCard';
import { getErrorMessage } from '../services/api';
import type { SpotifySearchItem, SpotifySearchResponse } from '../types';

const groups: Array<{ key: keyof SpotifySearchResponse; label: string }> = [
  { key: 'tracks', label: 'Tracks' }, { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' }, { key: 'playlists', label: 'Playlists' },
];

export const SearchPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [results, setResults] = useState<SpotifySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const debounced = useDebounce(query, 350);

  const runSearch = useCallback((value: string) => {
    if (!value) { setResults(null); setError(null); return; }
    setParams({ q: value }, { replace: true });
    if (configured === false) {
      setResults(null);
      setError('Music service is not configured. Add Spotify credentials to the backend environment.');
      return;
    }
    setLoading(true); setError(null);
    spotifyService.searchAll(value, 0, 8).then(setResults).catch((reason) => { setResults(null); setError(getErrorMessage(reason)); }).finally(() => setLoading(false));
  }, [configured, setParams]);

  useEffect(() => {
    spotifyService.getStatus().then((status) => setConfigured(status.configured)).catch(() => setConfigured(null));
  }, []);

  useEffect(() => { runSearch(debounced.trim()); }, [debounced, runSearch]);

  return (
    <div className="search-page">
      <header className="search-header"><p className="eyebrow">Search / Spotify</p><h1 className="page-title">Find your next sound.</h1><p className="page-copy">Tracks, artists, albums and playlists from Spotify.</p><label className="search-field panel-quiet"><SearchIcon size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a song, artist, album or playlist" aria-label="Search Spotify" /></label></header>
      {loading && <div className="search-skeletons" aria-label="Loading search results">{Array.from({ length: 6 }).map((_, index) => <span key={index} />)}</div>}
      {!loading && error && <div className="empty-inline panel-quiet"><span>{error}</span><button className="button-secondary" type="button" onClick={() => runSearch(query.trim())}>Retry</button></div>}
      {!loading && !error && results && groups.map(({ key, label }) => {
        const items = results[key];
        if (!items.length) return null;
        return <section key={key} className="search-group"><div className="section-heading"><h2 className="section-title">{label}</h2><span className="entry-count">{items.length}</span></div>{key === 'tracks' ? <div className="music-rail">{results.tracks.map((song) => <SongCard key={song.id} song={song} playlistContext={results.tracks} />)}</div> : <div className="search-result-list">{(items as SpotifySearchItem[]).map((item) => <a key={item.id} href={item.externalUrl || `https://open.spotify.com/${item.type}/${item.id}`} target="_blank" rel="noreferrer" className="search-result"><div className="artwork">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Music2 size={18} />}</div><span><strong>{item.name}</strong><small>{item.subtitle}</small></span><ExternalLink size={14} /></a>)}</div>}</section>;
      })}
      {!loading && !error && debounced.trim() && results && !groups.some(({ key }) => results[key].length) && <div className="empty-inline panel-quiet"><strong>No results for “{debounced.trim()}”</strong><span>Try another artist, song or album.</span></div>}
      {!loading && !error && !debounced.trim() && <div className="search-prompt panel-quiet">Start typing to search Spotify.</div>}
    </div>
  );
};
