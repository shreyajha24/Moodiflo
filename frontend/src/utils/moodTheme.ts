export interface ShiftTarget {
  targetMood: string;
  label: string;
  emoji: string;
  description: string;
}

export interface MoodTheme {
  name: string;
  displayName: string;
  emoji: string;
  vibeTagline: string;
  category: 'vibrant' | 'balanced' | 'quiet';
  isDominant: boolean; // positive/vibrant moods visually lead
  primaryColor: string;
  secondaryColor: string;
  ambientGradient: string;
  cardClasses: string;
  badgeClasses: string;
  shiftTargets?: ShiftTarget[];
}

export const MOOD_THEMES: Record<string, MoodTheme> = {
  HAPPY: {
    name: 'HAPPY',
    displayName: 'Happy',
    emoji: '☀️',
    vibeTagline: 'Bright, radiant, and full of sunshine',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#f59e0b', // amber
    secondaryColor: '#f97316', // orange
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.18) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-100 hover:border-amber-400 hover:shadow-amber-500/20',
    badgeClasses: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
  },
  ENERGETIC: {
    name: 'ENERGETIC',
    displayName: 'Energetic',
    emoji: '⚡',
    vibeTagline: 'High pulse, explosive, unstoppable motion',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#ef4444', // coral red
    secondaryColor: '#f43f5e', // rose
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.2) 0%, rgba(244, 63, 94, 0.06) 50%, transparent 80%)',
    cardClasses: 'from-rose-500/25 to-red-600/10 border-rose-500/35 text-rose-100 hover:border-rose-400 hover:shadow-rose-500/25',
    badgeClasses: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
  },
  PARTY: {
    name: 'PARTY',
    displayName: 'Party',
    emoji: '🎉',
    vibeTagline: 'Euphoric beats, celebration, vibrant celebration',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#ec4899', // pink
    secondaryColor: '#8b5cf6', // violet
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 80%)',
    cardClasses: 'from-pink-500/20 to-purple-600/10 border-pink-500/30 text-pink-100 hover:border-pink-400 hover:shadow-pink-500/20',
    badgeClasses: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
  },
  HOPEFUL: {
    name: 'HOPEFUL',
    displayName: 'Hopeful',
    emoji: '🌱',
    vibeTagline: 'Fresh dawn, rising optimism, pure light',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#10b981', // emerald
    secondaryColor: '#06b6d4', // cyan
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-100 hover:border-emerald-400 hover:shadow-emerald-500/20',
    badgeClasses: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  },
  CALM: {
    name: 'CALM',
    displayName: 'Calm',
    emoji: '🌊',
    vibeTagline: 'Deep breath, tranquil waters, gentle stillness',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#06b6d4', // cyan
    secondaryColor: '#3b82f6', // sky blue
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.16) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-100 hover:border-cyan-400 hover:shadow-cyan-500/20',
    badgeClasses: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
  },
  FOCUS: {
    name: 'FOCUS',
    displayName: 'Focus',
    emoji: '🎯',
    vibeTagline: 'Deep flow state, structured clarity, zero noise',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#6366f1', // indigo
    secondaryColor: '#3b82f6', // blue
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-indigo-500/20 to-blue-600/10 border-indigo-500/30 text-indigo-100 hover:border-indigo-400 hover:shadow-indigo-500/20',
    badgeClasses: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
  },
  ROMANTIC: {
    name: 'ROMANTIC',
    displayName: 'Romantic',
    emoji: '🌸',
    vibeTagline: 'Intimate warmth, heart-drawn chords, tenderness',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#f43f5e', // rose
    secondaryColor: '#e11d48', // red rose
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.18) 0%, rgba(225, 29, 72, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-rose-500/20 to-pink-600/10 border-rose-500/30 text-rose-100 hover:border-rose-400 hover:shadow-rose-500/20',
    badgeClasses: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
  },
  DREAMY: {
    name: 'DREAMY',
    displayName: 'Dreamy',
    emoji: '✨',
    vibeTagline: 'Floating reverie, twilight haze, ethereal sound',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#a855f7', // purple
    secondaryColor: '#818cf8', // periwinkle
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.18) 0%, rgba(129, 140, 248, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30 text-purple-100 hover:border-purple-400 hover:shadow-purple-500/20',
    badgeClasses: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
  },
  NOSTALGIC: {
    name: 'NOSTALGIC',
    displayName: 'Nostalgic',
    emoji: '🍂',
    vibeTagline: 'Golden memories, vintage tape, bittersweet warmth',
    category: 'balanced',
    isDominant: false,
    primaryColor: '#d97706', // amber-600
    secondaryColor: '#b45309',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.14) 0%, rgba(180, 83, 9, 0.04) 50%, transparent 80%)',
    cardClasses: 'from-amber-600/15 to-orange-700/10 border-amber-600/25 text-amber-200 hover:border-amber-500 hover:shadow-amber-600/15',
    badgeClasses: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
    shiftTargets: [
      { targetMood: 'HOPEFUL', label: 'Look Forward', emoji: '🌱', description: 'Transform memory into optimism' },
      { targetMood: 'HAPPY', label: 'Warm Glow', emoji: '☀️', description: 'Celebrate the good times' },
      { targetMood: 'CALM', label: 'Gentle Peace', emoji: '🌊', description: 'Rest in quiet reflection' },
    ],
  },
  SAD: {
    name: 'SAD',
    displayName: 'Low / Sad',
    emoji: '🌧️',
    vibeTagline: 'Quiet reflection, heavy heart — ready for a gentle lift',
    category: 'quiet',
    isDominant: false,
    primaryColor: '#64748b', // slate
    secondaryColor: '#475569',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(100, 116, 139, 0.12) 0%, rgba(71, 85, 105, 0.03) 50%, transparent 80%)',
    cardClasses: 'from-slate-700/20 to-slate-800/20 border-slate-700/40 text-slate-300 hover:border-slate-500',
    badgeClasses: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
    shiftTargets: [
      { targetMood: 'HAPPY', label: 'Lift Me Up', emoji: '☀️', description: 'Uplifting melodies to lighten your spirit' },
      { targetMood: 'CALM', label: 'Gentle Peace', emoji: '🌊', description: 'Soothing sounds to ease the weight' },
      { targetMood: 'ENERGETIC', label: 'Break the Fog', emoji: '⚡', description: 'Pulse and momentum to get moving' },
      { targetMood: 'HOPEFUL', label: 'Comfort Zone', emoji: '🌱', description: 'Gentle songs that reassure and comfort' },
    ],
  },
  MELANCHOLIC: {
    name: 'MELANCHOLIC',
    displayName: 'Melancholic',
    emoji: '🌙',
    vibeTagline: 'Introspective twilight, soft echoes',
    category: 'quiet',
    isDominant: false,
    primaryColor: '#475569',
    secondaryColor: '#334155',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(71, 85, 105, 0.12) 0%, rgba(51, 65, 85, 0.03) 50%, transparent 80%)',
    cardClasses: 'from-slate-800/30 to-slate-900/30 border-slate-700/30 text-slate-300 hover:border-slate-600',
    badgeClasses: 'bg-slate-800/40 text-slate-400 border-slate-700/40',
    shiftTargets: [
      { targetMood: 'HOPEFUL', label: 'First Light', emoji: '🌱', description: 'Melodies that bring tomorrow closer' },
      { targetMood: 'CALM', label: 'Restful Ocean', emoji: '🌊', description: 'Tranquility for a busy mind' },
      { targetMood: 'HAPPY', label: 'Sunbeam Shift', emoji: '☀️', description: 'Lighthearted tracks to smile with' },
    ],
  },
  ANGRY: {
    name: 'ANGRY',
    displayName: 'Frustrated / Restless',
    emoji: '🔥',
    vibeTagline: 'Intense heat, tension — channel and release the energy',
    category: 'quiet',
    isDominant: false,
    primaryColor: '#78716c',
    secondaryColor: '#57534e',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(120, 113, 108, 0.15) 0%, rgba(87, 83, 78, 0.04) 50%, transparent 80%)',
    cardClasses: 'from-stone-800/30 to-stone-900/30 border-stone-700/30 text-stone-300 hover:border-stone-600',
    badgeClasses: 'bg-stone-800/40 text-stone-400 border-stone-700/40',
    shiftTargets: [
      { targetMood: 'CALM', label: 'Decompress', emoji: '🌊', description: 'Let tension wash away into serene rhythms' },
      { targetMood: 'FOCUS', label: 'Channel It', emoji: '🎯', description: 'Turn raw drive into productive focus' },
      { targetMood: 'ENERGETIC', label: 'Workout Release', emoji: '⚡', description: 'Burn off the heat with high-tempo tracks' },
    ],
  },
};

const DEFAULT_THEME = MOOD_THEMES['HAPPY'];

export function getMoodTheme(moodName?: string | null): MoodTheme {
  if (!moodName) return DEFAULT_THEME;
  const key = moodName.trim().toUpperCase();
  return MOOD_THEMES[key] || DEFAULT_THEME;
}

export function isLowMood(moodName?: string | null): boolean {
  if (!moodName) return false;
  const key = moodName.trim().toUpperCase();
  const theme = MOOD_THEMES[key];
  return theme?.category === 'quiet';
}

export function getShiftTargets(moodName?: string | null): ShiftTarget[] {
  const theme = getMoodTheme(moodName);
  if (theme.shiftTargets && theme.shiftTargets.length > 0) {
    return theme.shiftTargets;
  }
  // Default fallback shift
  return [
    { targetMood: 'HAPPY', label: 'Lift Me Up', emoji: '☀️', description: 'Bright tunes to lighten the mood' },
    { targetMood: 'CALM', label: 'Gentle Peace', emoji: '🌊', description: 'Soothing sounds to find balance' },
    { targetMood: 'ENERGETIC', label: 'Energy Boost', emoji: '⚡', description: 'Dynamic tracks to build momentum' },
  ];
}
