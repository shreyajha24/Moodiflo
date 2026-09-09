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
  isDominant: boolean;
  primaryColor: string;
  secondaryColor: string;
  ambientGradient: string;
  cardClasses: string;
  badgeClasses: string;
  shiftTargets?: ShiftTarget[];
}

/** Mood accents stay within Moodiflo cyan / purple / magenta atmosphere */
export const MOOD_THEMES: Record<string, MoodTheme> = {
  HAPPY: {
    name: 'HAPPY',
    displayName: 'Happy',
    emoji: '',
    vibeTagline: 'Bright, radiant, and full of sunshine',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#fbbf24',
    secondaryColor: '#f472b6',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.18) 0%, rgba(244, 114, 182, 0.06) 50%, transparent 80%)',
    cardClasses: 'from-cyan-400/20 to-pink-500/10 border-cyan-400/30 text-cyan-100',
    badgeClasses: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30',
  },
  ENERGETIC: {
    name: 'ENERGETIC',
    displayName: 'Energetic',
    emoji: '',
    vibeTagline: 'High pulse, explosive, unstoppable motion',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#e879f9',
    secondaryColor: '#a78bfa',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(232, 121, 249, 0.22) 0%, rgba(167, 139, 250, 0.08) 50%, transparent 80%)',
    cardClasses: 'from-fuchsia-500/25 to-violet-600/10 border-fuchsia-500/35 text-fuchsia-100',
    badgeClasses: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30',
  },
  PARTY: {
    name: 'PARTY',
    displayName: 'Party',
    emoji: '',
    vibeTagline: 'Euphoric beats, celebration, vibrant celebration',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#f472b6',
    secondaryColor: '#a78bfa',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(244, 114, 182, 0.2) 0%, rgba(167, 139, 250, 0.08) 50%, transparent 80%)',
    cardClasses: 'from-pink-500/20 to-purple-600/10 border-pink-500/30 text-pink-100',
    badgeClasses: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
  },
  HOPEFUL: {
    name: 'HOPEFUL',
    displayName: 'Hopeful',
    emoji: '',
    vibeTagline: 'Fresh dawn, rising optimism, pure light',
    category: 'vibrant',
    isDominant: true,
    primaryColor: '#22d3ee',
    secondaryColor: '#fbbf24',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.18) 0%, rgba(251, 191, 36, 0.06) 50%, transparent 80%)',
    cardClasses: 'from-cyan-500/20 to-amber-500/10 border-cyan-500/30 text-cyan-100',
    badgeClasses: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
  },
  CALM: {
    name: 'CALM',
    displayName: 'Calm',
    emoji: '',
    vibeTagline: 'Deep breath, tranquil waters, gentle stillness',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#22d3ee',
    secondaryColor: '#3b82f6',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.07) 50%, transparent 80%)',
    cardClasses: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-100',
    badgeClasses: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
  },
  FOCUS: {
    name: 'FOCUS',
    displayName: 'Focus',
    emoji: '',
    vibeTagline: 'Deep flow state, structured clarity, zero noise',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#3b82f6',
    secondaryColor: '#a78bfa',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2) 0%, rgba(167, 139, 250, 0.07) 50%, transparent 80%)',
    cardClasses: 'from-blue-500/20 to-violet-600/10 border-blue-500/30 text-blue-100',
    badgeClasses: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  },
  ROMANTIC: {
    name: 'ROMANTIC',
    displayName: 'Romantic',
    emoji: '',
    vibeTagline: 'Intimate warmth, heart-drawn chords, tenderness',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#f472b6',
    secondaryColor: '#e879f9',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(244, 114, 182, 0.2) 0%, rgba(232, 121, 249, 0.07) 50%, transparent 80%)',
    cardClasses: 'from-pink-500/20 to-fuchsia-600/10 border-pink-500/30 text-pink-100',
    badgeClasses: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
  },
  DREAMY: {
    name: 'DREAMY',
    displayName: 'Dreamy',
    emoji: '',
    vibeTagline: 'Floating reverie, twilight haze, ethereal sound',
    category: 'balanced',
    isDominant: true,
    primaryColor: '#a78bfa',
    secondaryColor: '#22d3ee',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(167, 139, 250, 0.2) 0%, rgba(34, 211, 238, 0.07) 50%, transparent 80%)',
    cardClasses: 'from-violet-500/20 to-cyan-600/10 border-violet-500/30 text-violet-100',
    badgeClasses: 'bg-violet-500/20 text-violet-200 border-violet-400/30',
  },
  NOSTALGIC: {
    name: 'NOSTALGIC',
    displayName: 'Nostalgic',
    emoji: '',
    vibeTagline: 'Golden memories, vintage tape, bittersweet warmth',
    category: 'balanced',
    isDominant: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#a78bfa',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.16) 0%, rgba(167, 139, 250, 0.06) 50%, transparent 80%)',
    cardClasses: 'from-blue-600/15 to-violet-700/10 border-blue-600/25 text-blue-200',
    badgeClasses: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
    shiftTargets: [
      { targetMood: 'HOPEFUL', label: 'Look Forward', emoji: '', description: 'Transform memory into optimism' },
      { targetMood: 'HAPPY', label: 'Warm Glow', emoji: '', description: 'Celebrate the good times' },
      { targetMood: 'CALM', label: 'Gentle Peace', emoji: '', description: 'Rest in quiet reflection' },
    ],
  },
  SAD: {
    name: 'SAD',
    displayName: 'Low / Sad',
    emoji: '',
    vibeTagline: 'Quiet reflection, heavy heart ? ready for a gentle lift',
    category: 'quiet',
    isDominant: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.14) 0%, rgba(100, 116, 139, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-blue-800/20 to-slate-800/20 border-blue-700/40 text-slate-300',
    badgeClasses: 'bg-blue-800/30 text-slate-300 border-blue-700/40',
    shiftTargets: [
      { targetMood: 'HAPPY', label: 'Lift Me Up', emoji: '', description: 'Uplifting melodies to lighten your spirit' },
      { targetMood: 'CALM', label: 'Gentle Peace', emoji: '', description: 'Soothing sounds to ease the weight' },
      { targetMood: 'ENERGETIC', label: 'Break the Fog', emoji: '', description: 'Pulse and momentum to get moving' },
      { targetMood: 'HOPEFUL', label: 'Comfort Zone', emoji: '', description: 'Gentle songs that reassure and comfort' },
    ],
  },
  MELANCHOLIC: {
    name: 'MELANCHOLIC',
    displayName: 'Melancholic',
    emoji: '',
    vibeTagline: 'Introspective twilight, soft echoes',
    category: 'quiet',
    isDominant: false,
    primaryColor: '#6366f1',
    secondaryColor: '#3b82f6',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.14) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 80%)',
    cardClasses: 'from-indigo-800/30 to-blue-900/30 border-indigo-700/30 text-slate-300',
    badgeClasses: 'bg-indigo-800/40 text-slate-400 border-indigo-700/40',
    shiftTargets: [
      { targetMood: 'HOPEFUL', label: 'First Light', emoji: '', description: 'Melodies that bring tomorrow closer' },
      { targetMood: 'CALM', label: 'Restful Ocean', emoji: '', description: 'Tranquility for a busy mind' },
      { targetMood: 'HAPPY', label: 'Sunbeam Shift', emoji: '', description: 'Lighthearted tracks to smile with' },
    ],
  },
  ANGRY: {
    name: 'ANGRY',
    displayName: 'Frustrated / Restless',
    emoji: '',
    vibeTagline: 'Intense heat, tension ? channel and release the energy',
    category: 'quiet',
    isDominant: false,
    primaryColor: '#e879f9',
    secondaryColor: '#a78bfa',
    ambientGradient: 'radial-gradient(circle at 50% 0%, rgba(232, 121, 249, 0.16) 0%, rgba(167, 139, 250, 0.06) 50%, transparent 80%)',
    cardClasses: 'from-fuchsia-800/30 to-violet-900/30 border-fuchsia-700/30 text-fuchsia-200',
    badgeClasses: 'bg-fuchsia-800/40 text-fuchsia-300 border-fuchsia-700/40',
    shiftTargets: [
      { targetMood: 'CALM', label: 'Decompress', emoji: '', description: 'Let tension wash away into serene rhythms' },
      { targetMood: 'FOCUS', label: 'Channel It', emoji: '', description: 'Turn raw drive into productive focus' },
      { targetMood: 'ENERGETIC', label: 'Workout Release', emoji: '', description: 'Burn off the heat with high-tempo tracks' },
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
  return [
    { targetMood: 'HAPPY', label: 'Lift Me Up', emoji: '', description: 'Bright tunes to lighten the mood' },
    { targetMood: 'CALM', label: 'Gentle Peace', emoji: '', description: 'Soothing sounds to find balance' },
    { targetMood: 'ENERGETIC', label: 'Energy Boost', emoji: '', description: 'Dynamic tracks to build momentum' },
  ];
}
