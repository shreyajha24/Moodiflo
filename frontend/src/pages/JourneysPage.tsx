import React, { useEffect, useState } from 'react';
import { ArrowRight, Play, Route } from 'lucide-react';
import { historyService } from '../services/historyService';
import { usePlayer } from '../hooks/usePlayer';
import type { SongView } from '../types';

export const JourneysPage: React.FC = () => {
  const [history, setHistory] = useState<SongView[]>([]);
  const { playSong } = usePlayer();
  useEffect(() => { historyService.getHistory().then(setHistory).catch(() => setHistory([])); }, []);
  const trail = history.slice(0, 8);

  return (
    <div className="journey-page">
      <header className="journey-heading"><div><p className="eyebrow">Journey · your listening path</p><h1 className="page-title">See where your taste moves next.</h1><p className="page-copy">A connected trail made from what you play and discover.</p></div><Route className="journey-heading-icon" /></header>
      {trail.length ? <section className="journey-route panel"><div className="section-heading"><div><p className="eyebrow">Listening path</p><h2 className="section-title">Recent discoveries</h2></div><span className="entry-count">{trail.length} moments</span></div><div className="journey-path">{trail.map((song, index) => <button key={`${song.id}-${index}`} className="journey-stage" onClick={() => playSong(song, trail)}><span className="journey-stage-dot" /><div className="journey-stage-art artwork">{song.coverImageUrl && <img src={song.coverImageUrl} alt="" />}</div><span className="journey-stage-copy"><small>Discovery {index + 1}</small><strong>{song.title}</strong><em>{song.artist}</em></span><span className="journey-stage-play"><Play size={13} /></span></button>)}</div><div className="journey-footer"><span>Keep listening to extend the path.</span><button className="button-link" onClick={() => trail[0] && playSong(trail[0], trail)}>Play your trail <ArrowRight size={14} /></button></div></section> : <div className="empty-inline panel-quiet"><strong>Your journey starts with your next discovery.</strong><span>Play a song and it will become the first point on your path.</span></div>}
    </div>
  );
};
