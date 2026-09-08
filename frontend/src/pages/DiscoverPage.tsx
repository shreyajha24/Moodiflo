import React, { useEffect, useState } from 'react';
import { Compass, Play } from 'lucide-react';
import { songService } from '../services/songService';
import type { SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';

export const DiscoverPage: React.FC = () => {
  const [songs, setSongs] = useState<SongView[]>([]);
  const { playSong } = usePlayer();

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
};
