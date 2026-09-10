import React, { useEffect, useState } from 'react';
import { X, Languages, Loader2, Music, Sparkles } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../services/api';
import { songService } from '../../services/songService';

const LANGUAGES = [
  { label: 'Spanish', code: 'es' },
  { label: 'French', code: 'fr' },
  { label: 'Hindi', code: 'hi' },
  { label: 'German', code: 'de' },
  { label: 'Japanese', code: 'ja' },
  { label: 'Italian', code: 'it' },
];
const languageLabel = (code: string) => LANGUAGES.find((language) => language.code === code)?.label || code;

export const LyricsModal: React.FC = () => {
  const { currentSong, isLyricsOpen, closeLyrics } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [translatedLyrics, setTranslatedLyrics] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLyricsOpen || !currentSong) return;
    let active = true;
    setLoading(true); setLyrics([]); setTranslatedLyrics(null); setLyricsError(null); setTranslationError(null);
    songService.getLyricsForTrack(currentSong)
      .then((result) => {
        if (!active) return;
        if (result.available && result.lyrics) {
          setLyrics(result.lyrics.split('\n'));
          setSourceLanguage(result.language || currentSong.language || 'en');
        } else setLyricsError(result.message || 'Lyrics are not available for this song.');
      })
      .catch((reason: unknown) => { if (active) setLyricsError(getErrorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isLyricsOpen, currentSong]);

  const handleTranslate = async () => {
    if (!currentSong) return;
    if (!lyrics.length) { setTranslationError('Lyrics are unavailable, so there is nothing to translate.'); return; }
    if (!isAuthenticated) { info('Please log in to translate lyrics'); return; }
    setTranslating(true); setTranslationError(null);
    try {
      const result = await songService.translateText(lyrics.join('\n'), selectedLanguage, sourceLanguage);
      setTranslatedLyrics(result.translatedText);
      success(`Translated lyrics into ${selectedLanguage}.`);
    } catch (reason: unknown) {
      setTranslationError(getErrorMessage(reason));
      error(getErrorMessage(reason));
    } finally { setTranslating(false); }
  };

  if (!isLyricsOpen || !currentSong) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-[#0d0f18] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/40 p-6">
          <div className="flex min-w-0 items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-600/20">{currentSong.coverImageUrl ? <img src={currentSong.coverImageUrl} alt="" className="h-full w-full object-cover" /> : <Music className="text-violet-400" />}</div><div className="min-w-0"><h3 className="truncate text-lg font-bold text-white">{currentSong.title}</h3><p className="truncate text-sm text-slate-400">{currentSong.artist}</p></div></div>
          <button onClick={closeLyrics} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close lyrics"><X /></button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-slate-950/40 px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Lyrics & translation</span>
          <div className="flex items-center gap-2"><Languages className="h-4 w-4 text-violet-400" /><select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)} className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white">{LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select><button onClick={handleTranslate} disabled={translating || !lyrics.length} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{translating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Translate</button></div>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {loading && <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /><p>Fetching lyrics...</p></div>}
          {!loading && lyricsError && <div className="flex h-64 flex-col items-center justify-center text-center"><Music className="mb-3 h-12 w-12 text-slate-600" /><p className="font-semibold text-slate-300">{lyricsError}</p><p className="mt-2 text-xs text-slate-500">Playback is independent of lyrics availability.</p></div>}
          {!loading && !lyricsError && <div className="grid grid-cols-1 gap-8 md:grid-cols-2"><div className="space-y-3"><h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">Original ({languageLabel(sourceLanguage)})</h4>{lyrics.map((line, index) => <p key={index} className="text-sm leading-relaxed text-slate-300">{line || ' '}</p>)}</div><div className="space-y-3 border-white/10 md:border-l md:pl-6"><h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">{languageLabel(selectedLanguage)} translation</h4>{translationError && <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-300">{translationError}</p>}{translatedLyrics ? translatedLyrics.split('\n').map((line, index) => <p key={index} className="text-sm leading-relaxed text-cyan-100">{line || ' '}</p>) : !translationError && <p className="text-xs text-slate-400">Choose a language and translate when you are ready.</p>}</div></div>}
        </div>
      </div>
    </div>
  );
};
