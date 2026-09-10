import React, { useState } from 'react';
import { Languages, Loader2, Sparkles } from 'lucide-react';
import { songService } from '../services/songService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { TextTranslationView } from '../types';

const LANGUAGES = [
  { label: 'Spanish', code: 'es' },
  { label: 'French', code: 'fr' },
  { label: 'Hindi', code: 'hi' },
  { label: 'German', code: 'de' },
  { label: 'Japanese', code: 'ja' },
  { label: 'Italian', code: 'it' },
];
const languageLabel = (code: string) => LANGUAGES.find((language) => language.code === code)?.label || code;

export const TranslationPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [result, setResult] = useState<TextTranslationView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) { setError('Enter text to translate.'); return; }
    if (!isAuthenticated) { setError('Sign in to use translation.'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      setResult(await songService.translateText(text.trim(), targetLanguage));
    } catch (reason: unknown) {
      setError(getErrorMessage(reason));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="page-heading">
        <p className="eyebrow">Translation - independent text translation</p>
        <h1 className="page-title">Translate without needing a song.</h1>
        <p className="page-copy">Enter your own text and translate it with Moodiflo's server-side Google Cloud provider.</p>
      </header>
      <form onSubmit={translate} className="glass-panel rounded-3xl p-6 md:p-8 space-y-5">
        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Enter text to translate..." aria-label="Text to translate" rows={8} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-cyan-400" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300"><Languages size={16} className="text-cyan-400" />
            <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white">
              {LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
            </select>
          </label>
          <button type="submit" disabled={loading} className="button-primary inline-flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Translate
          </button>
        </div>
      </form>
      {error && <div className="empty-inline panel-quiet text-rose-300">{error}</div>}
      {result && <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <article className="panel-quiet rounded-2xl p-5"><p className="eyebrow">Original</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">{result.originalText}</p></article>
        <article className="panel-quiet rounded-2xl p-5"><p className="eyebrow">{languageLabel(result.targetLanguage)} translation</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-cyan-100">{result.translatedText}</p></article>
      </section>}
    </div>
  );
};
