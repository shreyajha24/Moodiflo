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
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (song: SongView) => {
    playSong(song, selected?.tracks || [song]);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="max-w-3xl space-y-3">
        <p className="eyebrow">Sargam · music in motion</p>
        <h1 className="page-title">Explore the world through sound.</h1>
        <p className="page-copy">Search any real place. Moodiflo resolves its geography, then finds real Spotify catalog results for that musical context.</p>
      </header>

      <form onSubmit={explore} className="panel flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative min-w-0 flex-1">
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
      )}
    </div>
  );
};
