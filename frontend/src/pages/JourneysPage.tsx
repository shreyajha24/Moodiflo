import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { songService } from '../services/songService';
import type { SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';

const stages = ['Begin', 'Drift', 'Discover', 'Rise', 'Arrive'];

export const JourneysPage: React.FC = () => {
  const [songs, setSongs] = useState<SongView[]>([]);
  const { playSong } = usePlayer();

  useEffect(() => {
    songService.getAllSongs(0, 5).then((page) => setSongs(page.content)).catch(() => setSongs([]));
  }, []);

  return (
    <div className="space-y-16 pb-12">
      <header className="max-w-2xl space-y-4">
        <p className="eyebrow text-[#D97870]">Journey</p>
        <h1 className="page-title">Let the listening unfold.</h1>
        <p className="page-copy">A simple path from one feeling to the next.</p>
      </header>
      <section className="panel p-5 sm:p-8">
        <div className="journey-path">
          {stages.map((stage, index) => (
            <article key={stage} className="journey-stage">
              <div className="journey-stage-dot" />
              <div className="journey-stage-art artwork">
                {songs[index]?.coverImageUrl && <img src={songs[index].coverImageUrl} alt="" />}
              </div>
              <div className="journey-stage-copy">
                <p className="text-[10px] uppercase tracking-widest text-[#A7ABC0]">{stage}</p>
                {songs[index] && <p className="mt-1 truncate text-sm font-semibold text-white">{songs[index].title}</p>}
              </div>
            </article>
          ))}
        </div>
        <button onClick={() => songs.length && playSong(songs[0], songs)} className="button-primary mt-8">
          <Play className="h-4 w-4 fill-current" /> Begin journey
        </button>
      </section>
    </div>
  );
};
