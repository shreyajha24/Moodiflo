export interface UserView {
  id: number;
  name: string;
  email: string;
  profileImage?: string | null;
  preferredLanguage?: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  preferredLanguage?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserView;
}

export interface SongView {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  duration?: number | null; // in seconds
  audioUrl?: string | null;
  coverImageUrl?: string | null;
  language?: string | null;
  genre?: string | null;
  releaseDate?: string | null;
  description?: string | null;
  spotifyUri?: string | null;
  spotifyTrackId?: string | null;
  provider?: string | null;
  providerTrackId?: string | null;
}

export interface SargamPlaceView {
  displayName: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  tracks: SongView[];
}

export interface MoodView {
  id: number;
  name: string;
  description: string;
  emoji: string;
  intensity: number; // 0.0 to 1.0
  recommendedGenres: string[];
}

export interface MoodSessionRequest {
  mood: string;
  intensity?: number;
  language?: string;
}

export interface MoodSessionResponse {
  sessionId: string;
  mood: string;
  playlistName: string;
  songs: SongView[];
}

export interface TranslationRequest {
  targetLanguage: string;
}

export interface TranslationView {
  songId: number;
  songTitle: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalLyrics: string;
  translatedLyrics: string;
}

export interface HistoryRequest {
  songId: number;
  completionPercentage: number;
  selectedMood?: string;
}

export interface PlaylistRequest {
  name: string;
  description?: string;
  coverImageUrl?: string;
}

export interface PlaylistView {
  id: number;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  songs: SongView[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DiscoveryResponse {
  greeting: string;
  suggestedMood: string;
  moodCards: MoodView[];
  continueListening: SongView[];
  becauseYouListened: SongView[];
  recentlyPlayed: SongView[];
  recommendedForYou: SongView[];
  trending: SongView[];
}

export interface QueryRequest {
  query: string;
}

export interface QueryResponse {
  interpretedMood: string;
  confidence: number;
  songs: SongView[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface SpotifyStatusView {
  connected: boolean;
  configured: boolean;
  displayName?: string | null;
  product?: string | null;
}

export interface SargamPlaceView {
  displayName: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  tracks: SongView[];
}

export interface MusicPageResponse {
  mood: string;
  songs: SongView[];
  page: number;
  limit: number;
  hasMore: boolean;
}
