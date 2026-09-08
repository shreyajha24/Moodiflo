import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Compass,
  Globe2,
  Minus,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react';
import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps';
import { useNavigate } from 'react-router-dom';
import { sargamWorldData, type SargamRegion } from '../data/sargamWorldData';
import { usePlayer } from '../hooks/usePlayer';
import type { SongView } from '../types';

const geoJsonUrl = '/world-110m.json';

export const WorldPage: React.FC = () => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, togglePlay, setStoryContext } = usePlayer();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(1.15);
  const [rotation, setRotation] = useState<[number, number]>([
    -sargamWorldData[0].coordinates[0],
    -sargamWorldData[0].coordinates[1],
  ]);
  const [projectionType, setProjectionType] = useState<'orthographic' | 'equalEarth'>('orthographic');

  const activeRegion = sargamWorldData[selectedIndex];
  const connectedRegion = useMemo(() => {
    return (
      sargamWorldData.find((r) => r.id === activeRegion.connectedRegionId) ||
      sargamWorldData[(selectedIndex + 1) % sargamWorldData.length]
    );
  }, [activeRegion, selectedIndex]);

  const selectRegion = (index: number) => {
    setSelectedIndex(index);
    const target = sargamWorldData[index];
    setRotation([-target.coordinates[0], -target.coordinates[1]]);
    setStoryContext(`Sargam · ${target.name}`);
  };

  const handlePlayRegionTrack = (trackIndex = 0) => {
    const track = activeRegion.sampleTracks[trackIndex] || activeRegion.sampleTracks[0];
    const mockSong: SongView = {
      id: 9000 + selectedIndex * 10 + trackIndex,
      title: track.title,
      artist: track.artist,
      album: `${activeRegion.name} Soundscape`,
      duration: track.duration,
      audioUrl: track.audioUrl || 'https://example.com/demo-audio/1.mp3',
      coverImageUrl: `https://placehold.co/600x600/18223A/D9B56D?text=${encodeURIComponent(activeRegion.name)}`,
      language: activeRegion.country,
      genre: track.genre,
      releaseDate: '2026-09-08',
      description: `${activeRegion.sceneTitle} — ${activeRegion.soundDescription}`,
      spotifyUri: null,
      spotifyTrackId: null,
      provider: 'SARGAM',
      providerTrackId: `sargam-${activeRegion.id}-${trackIndex}`,
    };

    setStoryContext(`Sargam · ${activeRegion.name}`);
    playSong(mockSong, [mockSong], activeRegion.moodAffinity);
  };

  const isCurrentTrackPlaying = currentSong?.title === activeRegion.sampleTracks[0]?.title && isPlaying;

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#63B7AE]/30 bg-[#63B7AE]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#63B7AE]">
          <Globe2 className="h-3.5 w-3.5" />
          <span>Sargam — Explore the World Through Sound</span>
        </div>
        <h1 className="page-title">
          How music travels <br className="hidden sm:block" />across cultures.
        </h1>
        <p className="page-copy">
          Music is not trapped within national borders. It wanders across oceans, transforms through migration,
          and creates unexpected resonances across continents. Select any hub to explore its soundscape.
        </p>
      </header>

      {/* Interactive Globe Container */}
      <section className="relative overflow-hidden rounded-3xl border border-[#63B7AE]/20 bg-gradient-to-b from-[#11182B] to-[#0B1020] p-3 sm:p-6 shadow-2xl">
        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
          {/* Projection Toggle */}
          <div className="flex overflow-hidden rounded-full border border-white/10 bg-[#0B1020]/90 text-xs text-[#A7ABC0]">
            <button
              onClick={() => setProjectionType('orthographic')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                projectionType === 'orthographic' ? 'bg-[#63B7AE] text-[#0B1020] font-bold' : 'hover:text-white'
              }`}
            >
              3D Globe
            </button>
            <button
              onClick={() => setProjectionType('equalEarth')}
              className={`border-l border-white/10 px-3 py-1.5 font-medium transition-colors ${
                projectionType === 'equalEarth' ? 'bg-[#63B7AE] text-[#0B1020] font-bold' : 'hover:text-white'
              }`}
            >
              Flat Map
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex overflow-hidden rounded-full border border-white/10 bg-[#0B1020]/90 text-[#A7ABC0]">
            <button
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.25))}
              className="p-2 hover:text-white transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(2.8, z + 0.25))}
              className="border-l border-white/10 p-2 hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              aria-label="Reset view"
              onClick={() => {
                setZoom(1.15);
                setRotation([-activeRegion.coordinates[0], -activeRegion.coordinates[1]]);
              }}
              className="border-l border-white/10 p-2 hover:text-[#63B7AE] transition-colors"
              title="Reset center"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Current Active Sound Bridge Banner */}
        <div className="absolute top-4 left-4 z-20 max-w-sm rounded-2xl border border-white/10 bg-[#0B1020]/85 p-3.5 backdrop-blur-md hidden sm:block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#63B7AE]">Sound Bridge</span>
          <p className="mt-0.5 text-sm font-bold text-white">
            {activeRegion.name} <span className="text-[#D9B56D]">→</span> {connectedRegion.name}
          </p>
          <p className="mt-1 text-xs text-[#A7ABC0] line-clamp-2 leading-relaxed">
            {activeRegion.travelBridgeText}
          </p>
        </div>

        {/* Map / Globe Area */}
        <div className="h-[26rem] sm:h-[34rem] w-full cursor-grab active:cursor-grabbing">
          <ComposableMap
            projection={projectionType === 'orthographic' ? 'geoOrthographic' : 'geoEqualEarth'}
            projectionConfig={{
              scale: (projectionType === 'orthographic' ? 180 : 140) * zoom,
              rotate: projectionType === 'orthographic' ? [rotation[0], rotation[1], 0] : undefined,
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography={geoJsonUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#18223A"
                    stroke="#263653"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#23324d', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Connection Arcs */}
            <Line
              from={activeRegion.coordinates}
              to={connectedRegion.coordinates}
              stroke="#63B7AE"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="4 4"
            />

            {/* Markers for all Regions */}
            {sargamWorldData.map((reg, idx) => {
              const isSelected = idx === selectedIndex;
              const isBridge = reg.id === connectedRegion.id;

              return (
                <Marker key={reg.id} coordinates={reg.coordinates}>
                  <g
                    onClick={() => selectRegion(idx)}
                    className="cursor-pointer group"
                    transform="translate(0, 0)"
                  >
                    {/* Pulsing ring on active */}
                    {isSelected && (
                      <circle r={14} fill="#63B7AE" fillOpacity={0.2} className="animate-ping" />
                    )}

                    <circle
                      r={isSelected ? 6 : isBridge ? 5 : 3.5}
                      fill={isSelected ? '#D9B56D' : isBridge ? '#63B7AE' : '#8D86D9'}
                      stroke="#0B1020"
                      strokeWidth={1.5}
                      className="transition-transform group-hover:scale-150"
                    />

                    <text
                      textAnchor="middle"
                      y={-10}
                      style={{
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: isSelected ? '11px' : '9px',
                        fontWeight: isSelected ? '800' : '600',
                        fill: isSelected ? '#D9B56D' : '#EDEAF7',
                        pointerEvents: 'none',
                        textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                      }}
                    >
                      {reg.name.split(' ')[0]}
                    </text>
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* Horizontal Region Quick Selector on Mobile */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:hidden">
          {sargamWorldData.map((reg, idx) => (
            <button
              key={reg.id}
              onClick={() => selectRegion(idx)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedIndex === idx
                  ? 'bg-[#63B7AE] text-[#0B1020]'
                  : 'bg-white/5 text-[#A7ABC0] hover:text-white'
              }`}
            >
              {reg.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Storytelling & Music Section for the Selected Region */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Region Cultural Narrative & Lead Track */}
        <article className="panel p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[#63B7AE]">{activeRegion.continent} · {activeRegion.country}</span>
              <span className="rounded-full bg-[#D9B56D]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#D9B56D]">
                Mood: {activeRegion.moodAffinity}
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-bold text-white font-display">{activeRegion.name}</h2>
            <p className="mt-1 text-base font-semibold text-[#63B7AE]">{activeRegion.sceneTitle}</p>
          </div>

          <p className="text-sm leading-relaxed text-[#EDEAF7]">
            {activeRegion.culturalStory}
          </p>

          <p className="text-xs text-[#A7ABC0] leading-relaxed">
            <strong className="text-white">Sonic Character:</strong> {activeRegion.soundDescription}
          </p>

          {/* Lead Track Action */}
          <div className="rounded-2xl border border-white/10 bg-[#18223A] p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#63B7AE]/15 text-[#63B7AE]">
                <Music2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#63B7AE]">Start Here</span>
                <p className="truncate text-sm font-semibold text-white">{activeRegion.sampleTracks[0]?.title}</p>
                <p className="truncate text-xs text-[#A7ABC0]">{activeRegion.sampleTracks[0]?.artist}</p>
              </div>
            </div>

            <button
              onClick={() => handlePlayRegionTrack(0)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#63B7AE] text-[#0B1020] hover:scale-105 transition-transform"
              aria-label="Play representative track"
            >
              {isCurrentTrackPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>
          </div>

          {/* Action: Transition to Journey */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <span className="text-xs text-[#A7ABC0]">Take this regional sound into a dynamic path:</span>
            <button
              onClick={() => {
                setStoryContext(`Journey · ${activeRegion.name}`);
                navigate('/journeys');
              }}
              className="button-primary text-xs"
            >
              <Compass className="h-4 w-4" />
              <span>Take this sound on a Journey →</span>
            </button>
          </div>
        </article>

        {/* Right: How Music Travels Bridge + Adjacent Hub */}
        <aside className="panel-quiet p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D9B56D]">
                  How Music Travels
                </span>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {activeRegion.name} <span className="text-[#63B7AE]">→</span> {connectedRegion.name}
                </h3>
              </div>
              <Waves className="h-5 w-5 text-[#63B7AE]" />
            </div>

            <p className="text-xs leading-relaxed text-[#EDEAF7]">
              {activeRegion.travelBridgeText}
            </p>

            {/* Genres & Artists Tags */}
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[11px] font-semibold text-[#A7ABC0]">Key Genres:</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {activeRegion.primaryGenres.map((g) => (
                    <span
                      key={g}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#EDEAF7]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#A7ABC0]">Pioneering Voices:</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {activeRegion.keyArtists.map((a) => (
                    <span
                      key={a}
                      className="rounded-lg border border-[#8D86D9]/20 bg-[#8D86D9]/10 px-2.5 py-1 text-[11px] font-medium text-[#8D86D9]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Jump to Connected Hub */}
          <div className="rounded-2xl border border-[#D9B56D]/20 bg-[#D9B56D]/5 p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9B56D]">Next Destination</span>
              <p className="text-sm font-bold text-white">{connectedRegion.name}</p>
              <p className="text-[11px] text-[#A7ABC0]">{connectedRegion.sceneTitle}</p>
            </div>
            <button
              onClick={() => {
                const targetIdx = sargamWorldData.findIndex((r) => r.id === connectedRegion.id);
                if (targetIdx !== -1) selectRegion(targetIdx);
              }}
              className="button-link text-xs font-bold"
            >
              <span>Follow route</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
};

