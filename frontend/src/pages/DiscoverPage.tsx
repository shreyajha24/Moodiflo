import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { ArrowRight, Compass, SlidersHorizontal } from 'lucide-react';
import { spotifyService } from '../services/spotifyService';
=======
import { Compass, Play } from 'lucide-react';
import { songService } from '../services/songService';
>>>>>>> 883cd514840436824f835fb925a0a25d880252f0
import type { SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';

export const DiscoverPage: React.FC = () => {
  const [songs, setSongs] = useState<SongView[]>([]);
  const { playSong } = usePlayer();
<<<<<<< HEAD
  useEffect(() => { spotifyService.search('music', 0, 12).then(setSongs).catch(() => setSongs([])); }, []);
  const node = (song: SongView, index: number) => <button key={song.id} onClick={() => playSong(song, songs)} className="discovery-node text-left"><div className="flex items-center gap-2"><div className="artwork h-[3.3rem] w-[3.3rem] shrink-0 rounded-full">{song.coverImageUrl ? <img src={song.coverImageUrl} alt="" /> : <div className="artwork-placeholder"><Compass className="h-4 w-4" /></div>}</div><span className="min-w-0"><strong className="block truncate text-xs text-[#EDEAF7]">{song.title}</strong><small className="block truncate text-[10px] text-[#A7ABC0]">{song.artist}</small></span></div><span className="mt-2 block text-[10px] uppercase tracking-wider text-[#8D86D9]">New to you · {index % 2 ? 'unexpected language' : 'a quieter genre'}</span></button>;
  return <div className="space-y-10"><header><p className="eyebrow">Unknown to you</p><h1 className="page-title">Discover music<br className="hidden sm:block" /> beyond your orbit.</h1><p className="page-copy">A field of unfamiliar voices, selected for contrast and connection.</p></header><section className="panel p-4 sm:p-6"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-[#8D86D9]">Your discovery field</p><p className="mt-2 text-sm text-[#A7ABC0]">Familiar → new → unexpected → unknown</p></div><div className="flex items-center gap-2 text-xs text-[#A7ABC0]"><SlidersHorizontal className="h-4 w-4" /> More serendipity</div></div><div className="discovery-field">{songs.slice(0, 4).map(node)}<div className="discovery-core">Find<br />unknown</div></div><div className="mt-6"><div className="mb-2 flex justify-between text-xs font-semibold text-[#A7ABC0]"><span>COMFORT</span><span className="text-[#D9B56D]">SERENDIPITY</span></div><input aria-label="Balance comfort and serendipity" type="range" min="0" max="100" value={serendipity} onChange={(event) => setSerendipity(Number(event.target.value))} className="w-full accent-[#8D86D9]" /></div></section><button onClick={() => songs[0] && playSong(songs[0], songs)} className="panel-quiet panel-hover flex items-center justify-between p-5 text-left"><span><span className="block text-xs uppercase tracking-wider text-[#8D86D9]">Start at the edge</span><strong className="mt-2 block text-base text-white">Play this discovery field</strong></span><ArrowRight className="h-5 w-5 text-[#D9B56D]" /></button></div>;
=======

  useEffect(() => {
    songService.getAllSongs(0, 6).then((page) => setSongs(page.content)).catch(() => setSongs([]));
  }, []);

  return (
    <div className="space-y-16 pb-12">
      <header className="max-w-2xl space-y-4">
        <p className="eyebrow">Discovery</p>
        <h1 className="page-title">Find something you haven't heard.</h1>
        <p className="page-copy">Search for a feeling, artist, or sound.</p>
      </header>

      <section className="panel space-y-8 p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Unknown music</p>
            <h2 className="section-title mt-2">A small field of possibilities</h2>
          </div>
          <Compass className="h-6 w-6 shrink-0 text-[#8D86D9]" />
        </div>
        {songs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {songs.map((song) => (
              <button key={song.id} onClick={() => playSong(song, songs)} className="track-row rounded-md text-left hover:bg-white/[0.04]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#8D86D9]/10 text-[#8D86D9]">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                <span className="track-row-copy">
                  <span className="track-row-title">{song.title}</span>
                  <span className="track-row-meta">{song.artist}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#A7ABC0]">No discovery tracks are available yet.</p>
        )}
        <button onClick={() => songs[0] && playSong(songs[0], songs)} className="button-primary w-fit">
          <Play className="h-4 w-4 fill-current" /> Play discovery
        </button>
      </section>
    </div>
  );
>>>>>>> 883cd514840436824f835fb925a0a25d880252f0
};
