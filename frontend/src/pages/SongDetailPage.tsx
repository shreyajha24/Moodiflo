import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Heart,
  Languages,
  Music,
  Clock,
  Calendar,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { songService } from '../services/songService';
import { favoriteService } from '../services/favoriteService';
import type { SongView, TranslationView } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ErrorState } from '../components/common/ErrorState';
import { getErrorMessage } from '../services/api';

const TRANSLATION_LANGUAGES = ['Spanish', 'French', 'Hindi', 'German', 'Japanese', 'Italian'];

export const SongDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [song, setSong] = useState<SongView | null>(null);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [translations, setTranslations] = useState<TranslationView[]>([]);
  const [targetLang, setTargetLang] = useState<string>('Spanish');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const songId = Number(id);

  const loadData = async () => {
    if (!songId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [songData, lyricsData, transData] = await Promise.all([
        songService.getSong(songId),
        songService.getLyrics(songId).catch(() => []),
        songService.getTranslations(songId).catch(() => []),
      ]);
      setSong(songData);
      setLyrics(lyricsData);
      setTranslations(transData);

      if (isAuthenticated) {
        const favs = await favoriteService.getFavorites().catch(() => []);
        setIsFavorite(favs.some((f) => f.id === songId));
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      info('Please log in to save favorites');
      navigate('/login');
      return;
    }
    if (!song) return;

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(song.id);
        setIsFavorite(false);
        success(`Removed "${song.title}" from favorites`);
      } else {
        await favoriteService.addFavorite(song.id);
        setIsFavorite(true);
        success(`Added "${song.title}" to favorites`);
      }
    } catch {
      error('Failed to update favorites');
    }
  };

  const handleTranslate = async () => {
    if (!song) return;
    if (!isAuthenticated) {
      info('Please log in to translate lyrics');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await songService.translateLyrics(song.id, targetLang);
      setTranslations((prev) => {
        const filtered = prev.filter((t) => t.targetLanguage.toLowerCase() !== targetLang.toLowerCase());
        return [res, ...filtered];
      });
      success(`Translated lyrics to ${targetLang}!`);
    } catch {
      error('Failed to translate lyrics');
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  if (errorMessage || !song) {
    return <ErrorState message={errorMessage || 'Song not found'} onRetry={loadData} />;
  }

  const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
  const currentTranslation = translations.find(
    (t) => t.targetLanguage.toLowerCase() === targetLang.toLowerCase()
  );

  return (
    <div className="space-y-12 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero Track Card */}
      <section className="glass-panel rounded-3xl p-6 md:p-10 border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-br from-violet-950/30 via-slate-900/60 to-slate-950">
        {/* Cover Art */}
        <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl bg-slate-800 shrink-0 border border-white/10">
          {song.coverImageUrl ? (
            <img
              src={song.coverImageUrl}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Music className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Track Metadata */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider">
            {song.genre || 'Song'}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {song.title}
          </h1>

          <p className="text-lg font-semibold text-violet-300">
            {song.artist}
            {song.album && <span className="text-slate-400 font-normal"> • {song.album}</span>}
          </p>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            {song.description || 'No description available for this track.'}
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-2">
            {song.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-violet-400" />
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
            {song.language && (
              <span className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-cyan-400" />
                {song.language}
              </span>
            )}
            {song.releaseDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                {song.releaseDate}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
            <button
              onClick={() => {
                if (currentSong?.id === song.id) {
                  togglePlay();
                } else {
                  playSong(song, [song]);
                }
              }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {isCurrentPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  Play Track
                </>
              )}
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`p-3.5 rounded-full border transition-all ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Save to Favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Lyrics & Translation Section */}
      <section className="glass-panel rounded-3xl p-6 md:p-10 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              Lyrics & Verse Translations
            </h3>
            <p className="text-xs text-slate-400">
              Read original lyrics and translate verses into your preferred language
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Languages className="w-4 h-4 text-violet-400" />
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
            >
              {TRANSLATION_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  Translate to {lang}
                </option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isTranslating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Translate
            </button>
          </div>
        </div>

        {lyrics.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Lyrics not available for this track yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Original Lyrics Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-4">
                Original Lyrics ({song.language || 'Original'})
              </h4>
              {lyrics.map((line, idx) => (
                <p key={idx} className="text-sm md:text-base text-slate-300 font-normal leading-relaxed">
                  {line || ' '}
                </p>
              ))}
            </div>

            {/* Translated Lyrics Column */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">
                {targetLang} Translation
              </h4>
              {currentTranslation ? (
                currentTranslation.translatedLyrics.split('\n').map((line, idx) => (
                  <p key={idx} className="text-sm md:text-base text-cyan-100 font-normal leading-relaxed">
                    {line || ' '}
                  </p>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-slate-400 mb-4">
                    No {targetLang} translation cached yet.
                  </p>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                  >
                    Generate {targetLang} Lyrics
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
