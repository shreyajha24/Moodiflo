import React, { useState, useEffect } from 'react';
import { X, Languages, Loader2, Music, Sparkles } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { songService } from '../../services/songService';
import type { TranslationView } from '../../types';

const POPULAR_LANGUAGES = ['Spanish', 'French', 'Hindi', 'German', 'Japanese', 'Italian'];

export const LyricsModal: React.FC = () => {
  const { currentSong, isLyricsOpen, closeLyrics } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [rawLyrics, setRawLyrics] = useState<string[]>([]);
  const [translations, setTranslations] = useState<TranslationView[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Spanish');
  const [activeTab, setActiveTab] = useState<'original' | 'translated' | 'both'>('both');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    if (isLyricsOpen && currentSong) {
      loadLyricsAndTranslations(currentSong.id);
    }
  }, [isLyricsOpen, currentSong]);

  const loadLyricsAndTranslations = async (songId: number) => {
    setIsLoadingLyrics(true);
    try {
      const [lyricsData, translationsData] = await Promise.all([
        songService.getLyrics(songId).catch(() => []),
        songService.getTranslations(songId).catch(() => []),
      ]);
      setRawLyrics(lyricsData);
      setTranslations(translationsData);
      if (translationsData.length > 0) {
        setSelectedLanguage(translationsData[0].targetLanguage);
      }
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  const handleTranslate = async () => {
    if (!currentSong) return;
    if (!isAuthenticated) {
      info('Please log in to translate lyrics');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await songService.translateLyrics(currentSong.id, selectedLanguage);
      setTranslations((prev) => {
        const filtered = prev.filter((t) => t.targetLanguage.toLowerCase() !== selectedLanguage.toLowerCase());
        return [result, ...filtered];
      });
      success(`Translated lyrics into ${selectedLanguage}!`);
    } catch {
      error('Failed to translate lyrics');
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isLyricsOpen || !currentSong) return null;

  const currentTranslation = translations.find(
    (t) => t.targetLanguage.toLowerCase() === selectedLanguage.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-full bg-[#0d0f18] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 overflow-hidden flex items-center justify-center shrink-0">
              {currentSong.coverImageUrl ? (
                <img src={currentSong.coverImageUrl} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-6 h-6 text-violet-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-lg font-bold text-white truncate">{currentSong.title}</h3>
              <p className="text-sm text-slate-400 truncate">{currentSong.artist}</p>
            </div>
          </div>
          <button
            onClick={closeLyrics}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Translation Controls Bar */}
        <div className="px-6 py-3 border-b border-white/5 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-sm">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'original' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setActiveTab('translated')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'translated' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Translated
            </button>
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'both' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {/* Language selector & translate action */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-violet-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-900 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500"
            >
              {POPULAR_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 disabled:opacity-50 transition-all"
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

        {/* Lyrics Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoadingLyrics ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <p className="text-sm">Fetching lyrics...</p>
            </div>
          ) : rawLyrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center">
              <Music className="w-12 h-12 stroke-1 mb-2 text-slate-600" />
              <p className="font-semibold text-slate-400">No lyrics available for this song yet.</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Lyrics are seeded for popular demo songs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'both' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">
                      Original Lyrics ({currentSong.language || 'English'})
                    </h5>
                    {rawLyrics.map((line, idx) => (
                      <p key={idx} className="text-sm text-slate-300 leading-relaxed font-normal">
                        {line || ' '}
                      </p>
                    ))}
                  </div>

                  {/* Translated */}
                  <div className="space-y-2 border-l border-white/5 pl-6">
                    <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                      {selectedLanguage} Translation
                    </h5>
                    {currentTranslation ? (
                      currentTranslation.translatedLyrics.split('\n').map((line, idx) => (
                        <p key={idx} className="text-sm text-cyan-100/90 leading-relaxed font-normal">
                          {line || ' '}
                        </p>
                      ))
                    ) : (
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <p className="text-xs text-slate-400 mb-3">
                          No {selectedLanguage} translation cached yet.
                        </p>
                        <button
                          onClick={handleTranslate}
                          disabled={isTranslating}
                          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                        >
                          Translate to {selectedLanguage}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'original' ? (
                <div className="max-w-lg mx-auto space-y-3 text-center">
                  {rawLyrics.map((line, idx) => (
                    <p key={idx} className="text-base text-slate-200 leading-relaxed font-medium">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="max-w-lg mx-auto space-y-3 text-center">
                  {currentTranslation ? (
                    currentTranslation.translatedLyrics.split('\n').map((line, idx) => (
                      <p key={idx} className="text-base text-cyan-200 leading-relaxed font-medium">
                        {line}
                      </p>
                    ))
                  ) : (
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <p className="text-sm text-slate-400 mb-4">
                        Click translate to generate {selectedLanguage} lyrics.
                      </p>
                      <button
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                      >
                        Translate Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
