import React, { useState } from 'react';
import { Globe2, MapPin, Play, Search } from 'lucide-react';
import { api } from '../services/api';
import { usePlayer } from '../hooks/usePlayer';
import type { SargamPlaceView, SongView } from '../types';

export const WorldPage: React.FC = () => {
  const { playSong } = usePlayer();
  const [place, setPlace] = useState('');
  const [selected, setSelected] = useState<SargamPlaceView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (params: { place: string } | { latitude: number; longitude: number }) => {
    setLoading(true); setError(null);
    try {
      const endpoint = 'place' in params ? '/api/sargam/explore' : '/api/sargam/reverse';
      const response = await api.get<SargamPlaceView>(endpoint, { params });
      setSelected(response.data);
    } catch (reason: unknown) {
      const message = (reason as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'This place could not be resolved. Try another search.');
    } finally { setLoading(false); }
  };

  const submit = (event: React.FormEvent) => { event.preventDefault(); if (place.trim()) void resolve({ place: place.trim() }); };
  const clickGlobe = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    void resolve({ longitude: ((event.clientX - rect.left) / rect.width) * 360 - 180, latitude: 90 - ((event.clientY - rect.top) / rect.height) * 180 });
  };
  const marker = selected ? { x: 500 + selected.longitude * 1.22, y: 260 - selected.latitude * 2.1 } : null;
  const playTrack = (song: SongView) => playSong(song, selected?.tracks || [song]);

  return (
    <div className="sargam-page">
      <header className="sargam-heading"><div><p className="eyebrow">Sargam · world to sound</p><h1 className="page-title">Music through place.</h1><p className="page-copy">Search a place or click the globe. Discover culture-aware Spotify tracks.</p></div><Globe2 className="sargam-heading-icon" /></header>
      <form onSubmit={submit} className="sargam-search panel-quiet"><MapPin size={17} /><input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Search a city or place" aria-label="Search a place" /><button className="button-primary" disabled={loading}><Search size={15} /> Explore</button></form>
      {loading && <div className="empty-inline panel-quiet">Searching {place.trim() || 'this place'}...</div>}
      {error && <div className="empty-inline panel-quiet">{error}</div>}
      <section className="sargam-layout">
        <div className="sargam-globe panel"><div className="globe-caption"><span><i /> Interactive globe</span><small>Click anywhere to resolve a place</small></div><svg viewBox="0 0 1000 520" onClick={clickGlobe} role="img" aria-label="Interactive globe map"><defs><radialGradient id="sargam-ocean" cx="35%" cy="28%"><stop offset="0%" stopColor="#3c9db5" /><stop offset="48%" stopColor="#164d70" /><stop offset="100%" stopColor="#071528" /></radialGradient><clipPath id="sargam-clip"><circle cx="500" cy="260" r="220" /></clipPath></defs><circle cx="500" cy="260" r="220" fill="url(#sargam-ocean)" stroke="#22d3ee" strokeOpacity=".65" strokeWidth="3" /><g clipPath="url(#sargam-clip)" fill="none" stroke="#8be8f4" strokeOpacity=".2"><ellipse cx="500" cy="260" rx="170" ry="220" /><ellipse cx="500" cy="260" rx="70" ry="220" /><ellipse cx="500" cy="260" rx="220" ry="150" /><ellipse cx="500" cy="260" rx="220" ry="70" /></g>{marker && <><circle cx={marker.x} cy={marker.y} r="16" fill="#22d3ee" opacity=".18" /><circle cx={marker.x} cy={marker.y} r="7" fill="#f472b6" stroke="#fff" strokeWidth="3" /></>}</svg><div className="globe-label">{selected?.displayName || 'Search or select a point'}<small>{selected ? `${selected.country || 'Resolved location'} · ${selected.tracks.length} tracks` : 'World discovery'}</small></div></div>
        <aside className="sargam-results"><div className="section-heading"><div><p className="eyebrow">Selected location</p><h2 className="section-title">{selected?.displayName || 'Nothing selected'}</h2>{selected && <p className="page-copy">Music discovered from Spotify</p>}</div></div>{selected && <div className="sargam-insights"><p><strong>Discovery categories</strong><br />{selected.genres.length ? selected.genres.join(' · ') : 'No categories were derived for this place yet.'}</p><p><strong>Artists returned by Spotify</strong><br />{selected.artists.length ? selected.artists.join(' · ') : 'No artist metadata returned.'}</p></div>}{selected ? selected.tracks.length ? <div className="track-list">{selected.tracks.map((song) => <button className="track-row" key={song.id} onClick={() => playTrack(song)}><div className="artwork">{song.coverImageUrl && <img src={song.coverImageUrl} alt="" />}</div><span className="track-row-copy"><span className="track-row-title">{song.title}</span><span className="track-row-meta">{song.artist}</span></span><Play size={14} /></button>)}</div> : <p className="empty-copy">No Spotify music found for this place. Try a nearby city or broader region.</p> : <p className="empty-copy">Your discoveries will appear here.</p>}</aside>
      </section>
    </div>
  );
};
