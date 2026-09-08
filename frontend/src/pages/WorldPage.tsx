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

  const resolveLocation = async (params: { place: string } | { latitude: number; longitude: number }) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = 'place' in params ? '/api/sargam/explore' : '/api/sargam/reverse';
      const response = await api.get<SargamPlaceView>(endpoint, { params });
      setSelected(response.data);
    } catch (reason: unknown) {
      const message = (reason as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Location not found.');
    } finally {
      setLoading(false);
    }
  };

  const explore = (event: React.FormEvent) => {
    event.preventDefault();
    if (place.trim()) void resolveLocation({ place: place.trim() });
  };

  const selectGlobePoint = (event: React.MouseEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const longitude = x * 360 - 180;
    const latitude = 90 - y * 180;
    void resolveLocation({ latitude, longitude });
  };

  const playTrack = (song: SongView) => playSong(song, selected?.tracks || [song]);
  const marker = selected
    ? { x: 500 + (selected.longitude / 180) * 220, y: 260 - (selected.latitude / 90) * 220 }
    : null;

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow text-[#63B7AE]">Sargam</p>
        <h1 className="page-title">Travel through<br className="hidden sm:block" /> music, not maps.</h1>
        <p className="page-copy">Choose a place and discover its sound.</p>
      </header>

      <form onSubmit={explore} className="panel flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#63B7AE]" />
          <input value={place} onChange={(event) => setPlace(event.target.value)} className="form-input w-full pl-11" placeholder="Search a country or place" />
        </div>
        <button className="button-primary shrink-0" disabled={loading}>
          <Search className="h-4 w-4" /> {loading ? 'Finding...' : 'Explore'}
        </button>
      </form>

      {error && <p className="panel-quiet p-4 text-sm text-[#D97870]">{error}</p>}

      <section className="world-canvas">
        <svg viewBox="0 0 1000 520" className="absolute inset-0 h-full w-full cursor-crosshair" onClick={selectGlobePoint} role="img" aria-label="Interactive geographic globe">
          <defs>
            <radialGradient id="globe-atmosphere" cx="32%" cy="28%">
              <stop offset="0%" stopColor="#4c8fa2" />
              <stop offset="42%" stopColor="#164b65" />
              <stop offset="82%" stopColor="#09253d" />
              <stop offset="100%" stopColor="#061524" />
            </radialGradient>
            <radialGradient id="globe-shine" cx="28%" cy="24%">
              <stop offset="0%" stopColor="#d8ffff" stopOpacity=".3" />
              <stop offset="55%" stopColor="#8bd9e0" stopOpacity=".06" />
              <stop offset="100%" stopColor="#8bd9e0" stopOpacity="0" />
            </radialGradient>
            <filter id="globe-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#020811" floodOpacity=".7" />
            </filter>
            <clipPath id="globe-clip"><circle cx="500" cy="260" r="220" /></clipPath>
          </defs>
          <circle cx="500" cy="260" r="220" fill="url(#globe-atmosphere)" stroke="#63B7AE" strokeOpacity=".65" strokeWidth="3" filter="url(#globe-shadow)" />
          <image
            href="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg"
            x="280" y="40" width="440" height="440" preserveAspectRatio="xMidYMid slice"
            clipPath="url(#globe-clip)" opacity=".58"
          />
          <circle cx="500" cy="260" r="220" fill="url(#globe-shine)" pointerEvents="none" />
          <g clipPath="url(#globe-clip)" fill="none" stroke="#63B7AE" strokeOpacity=".18" strokeWidth="1">
            {[-60, -30, 0, 30, 60].map((latitude) => <ellipse key={`lat-${latitude}`} cx="500" cy="260" rx={220 * Math.cos(latitude * Math.PI / 180)} ry="220" />)}
            {[-120, -60, 0, 60, 120].map((longitude) => <ellipse key={`lon-${longitude}`} cx="500" cy="260" rx={Math.max(18, 220 * Math.cos(longitude * Math.PI / 180))} ry="220" />)}
          </g>
          {marker && <circle cx={marker.x} cy={marker.y} r="8" fill="#D9B56D" stroke="#0B1020" strokeWidth="4" />}
        </svg>
        <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-[#0B1020]/60 p-3 text-[#63B7AE]">
          <Globe2 className="h-5 w-5" />
        </div>
        <div className="absolute bottom-5 left-5 max-w-xs sm:bottom-8 sm:left-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#63B7AE]">Sargam</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{selected?.displayName || 'Choose a place'}</h2>
          <p className="mt-2 text-xs leading-5 text-[#A7ABC0]">{selected ? `${selected.country || 'Location resolved'} · Spotify discovery` : 'Search to open a musical character.'}</p>
        </div>
      </section>

      {selected && (
        <section className="panel-quiet p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow text-[#63B7AE]">Music from this place</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{selected.displayName}</h2>
            </div>
            <Globe2 className="h-5 w-5 text-[#D9B56D]" />
          </div>
          {selected.tracks.length === 0 ? (
            <p className="text-sm text-[#A7ABC0]">Spotify returned no tracks for this place.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selected.tracks.map((song) => (
                <button key={song.id} onClick={() => playTrack(song)} className="track-row text-left">
                  <div className="artwork h-12 w-12 shrink-0">
                    {song.coverImageUrl && <img src={song.coverImageUrl} alt="" />}
                  </div>
                  <span className="track-row-copy">
                    <span className="track-row-title">{song.title}</span>
                    <span className="track-row-meta">{song.artist}</span>
                  </span>
                  <Play className="h-4 w-4 text-[#D9B56D]" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
