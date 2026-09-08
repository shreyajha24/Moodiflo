<<<<<<< HEAD
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
=======
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Globe2, MapPin, Play, Pause } from 'lucide-react';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { usePlayer } from '../hooks/usePlayer';
import type { SargamPlaceView, SongView } from '../types';
import { api } from '../services/api';

type WorldTopology = Topology<{ countries: GeometryCollection }>;
const width = 960;
const height = 520;

export const WorldPage: React.FC = () => {
  const { playSong, currentSong, isPlaying, setStoryContext } = usePlayer();
  const [place, setPlace] = useState('');
  const [selected, setSelected] = useState<SargamPlaceView | null>(null);
  const [world, setWorld] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/world-110m.json')
      .then((res) => {
        if (!res.ok) throw new Error('World geography could not be loaded.');
        return res.json() as Promise<WorldTopology>;
      })
      .then((topology) => setWorld(feature(topology, topology.objects.countries)))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'World geography could not be loaded.'));
  }, []);

  const projection = useMemo(() => geoEqualEarth().fitSize([width, height], world || { type: 'FeatureCollection', features: [] }), [world]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const selectedPoint = selected ? projection([selected.longitude, selected.latitude]) : null;

  const explore = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!place.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SargamPlaceView>('/api/sargam/explore', { params: { place: place.trim() } });
      setSelected(response.data);
      setStoryContext(`Sargam · ${response.data.displayName}`);
    } catch (reason: any) {
      setError(reason?.response?.data?.message || 'That place could not be explored. Please try another search.');
>>>>>>> 883cd514840436824f835fb925a0a25d880252f0
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const playTrack = (song: SongView) => {
    playSong(song, selected?.tracks || [song]);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="max-w-3xl space-y-3">
        <p className="eyebrow">Sargam · music in motion</p>
        <h1 className="page-title">Explore the world through sound.</h1>
        <p className="page-copy">Search any real place. Moodiflo resolves its geography, then finds real Spotify catalog results for that musical context.</p>
>>>>>>> 883cd514840436824f835fb925a0a25d880252f0
      </header>

      <form onSubmit={explore} className="panel flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative min-w-0 flex-1">
<<<<<<< HEAD
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
=======
          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#70D6D0]" />
          <input value={place} onChange={(event) => setPlace(event.target.value)} className="form-input w-full pl-11" placeholder="Search a place, region, or country" />
        </div>
        <button className="button-primary shrink-0" disabled={loading}>
          <Search className="h-4 w-4" /> {loading ? 'Resolving...' : 'Explore place'}
        </button>
      </form>

      {error && <p className="panel-quiet p-4 text-sm text-[#FF7A73]">{error}</p>}

      <section className="panel overflow-hidden p-2 sm:p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Interactive world map">
          <rect width={width} height={height} fill="#101a2e" rx="20" />
          {world?.features.map((country, index) => (
            <path key={index} d={path(country) || ''} fill="#1b2a43" stroke="#344763" strokeWidth="0.7" />
          ))}
          {selectedPoint && <circle cx={selectedPoint[0]} cy={selectedPoint[1]} r="8" fill="#70D6D0" stroke="#0B0D17" strokeWidth="3" />}
        </svg>
      </section>

      {selected ? (
        <section className="space-y-4">
          <div>
            <p className="eyebrow"><Globe2 className="mr-2 inline h-4 w-4" /> resolved place</p>
            <h2 className="section-title mt-2">{selected.displayName}</h2>
            <p className="section-copy">{selected.country || 'Location resolved'} · real catalog discovery through Spotify</p>
          </div>
          {selected.tracks.length === 0 ? (
            <p className="panel-quiet p-5 text-sm text-[#A9ACC1]">Spotify returned no tracks for this place.</p>
          ) : (
            <div className="panel-quiet divide-y divide-white/10">
              {selected.tracks.map((song) => {
                const active = currentSong?.id === song.id;
                return (
                  <button key={song.id} onClick={() => playTrack(song)} className="track-row w-full text-left hover:bg-white/[0.03]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#70D6D0]/10 text-[#70D6D0]">
                      {active && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </span>
                    <span className="track-row-copy">
                      <span className="track-row-title">{song.title}</span>
                      <span className="track-row-meta">{song.artist} · {song.album || 'Spotify catalog'}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <p className="text-sm text-[#A9ACC1]">Choose a place to begin a musical journey.</p>
>>>>>>> 883cd514840436824f835fb925a0a25d880252f0
      )}
    </div>
  );
};
