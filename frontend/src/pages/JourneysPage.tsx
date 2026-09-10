import React, { useEffect, useState } from 'react';
import { ArrowRight, Play, Route } from 'lucide-react';
import { historyService } from '../services/historyService';
import { discoveryService } from '../services/discoveryService';
import { getErrorMessage } from '../services/api';
import { SongCard } from '../components/common/SongCard';
import { usePlayer } from '../hooks/usePlayer';
import type { SongView } from '../types';

export const JourneysPage: React.FC = () => {
  const [history, setHistory] = useState<SongView[]>([]);
  const [recommendations, setRecommendations] = useState<SongView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playSong } = usePlayer();
  useEffect(() => {
    let active = true;
    Promise.all([historyService.getHistory(), discoveryService.getJourney()])
      .then(([recent, next]) => { if (active) { setHistory(recent); setRecommendations(next); } })
      .catch((reason: unknown) => { if (active) setError(getErrorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const trail = history.slice(0, 8);

  return (
    <div className="journey-page">
      <header className="journey-heading"><div><p className="eyebrow">Journey · your listening path</p><h1 className="page-title">See where your taste moves next.</h1><p className="page-copy">A connected trail made from what you play and discover.</p></div><Route className="journey-heading-icon" /></header>
      {loading && <div className="empty-inline panel-quiet">Building your Journey from your listening signals...</div>}
      {error && <div className="empty-inline panel-quiet">{error}</div>}
      {!loading && !error && trail.length ? <section className="journey-route panel"><div className="section-heading"><div><p className="eyebrow">Listening path</p><h2 className="section-title">Recent discoveries</h2></div><span className="entry-count">{trail.length} moments</span></div><div className="journey-path">{trail.map((song, index) => <button key={`${song.id}-${index}`} className="journey-stage" onClick={() => playSong(song, trail)}><span className="journey-stage-dot" /><div className="journey-stage-art artwork">{song.coverImageUrl && <img src={song.coverImageUrl} alt="" />}</div><span className="journey-stage-copy"><small>Discovery {index + 1}</small><strong>{song.title}</strong><em>{song.artist}</em></span><span className="journey-stage-play"><Play size={13} /></span></button>)}</div><div className="journey-footer"><span>Keep listening to extend the path.</span><button className="button-link" onClick={() => trail[0] && playSong(trail[0], trail)}>Play your trail <ArrowRight size={14} /></button></div></section> : null}
      {!loading && !error && recommendations.length > 0 && <section className="music-rail-section"><div className="section-heading"><div><p className="eyebrow">Based on your activity</p><h2 className="section-title">Your next path</h2></div></div><div className="music-rail">{recommendations.slice(0, 8).map((song) => <SongCard key={song.spotifyTrackId || song.id} song={song} playlistContext={recommendations} />)}</div></section>}
      {!loading && !error && !trail.length && !recommendations.length && <div className="empty-inline panel-quiet"><strong>Listen to a few songs and Journey will start building your music path.</strong><span>No recommendations were generated from your activity yet.</span></div>}
    </div>
  );
};
