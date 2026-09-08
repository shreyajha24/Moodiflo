import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { SongView } from '../types';
import { historyService } from '../services/historyService';
import { useAuth } from './AuthContext';
import { spotifyService } from '../services/spotifyService';

type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface PlayerContextType {
  currentSong: SongView | null;
  isPlaying: boolean;
  queue: SongView[];
  currentIndex: number;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLyricsOpen: boolean;
  activeMood: string | null;
  playbackStatus: PlaybackStatus;
  playbackError: string | null;
  setActiveMood: (mood: string | null) => void;
  playSong: (song: SongView, newQueue?: SongView[], moodContext?: string) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (percentage: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  retry: () => void;
  openLyrics: () => void;
  closeLyrics: () => void;
  toggleLyrics: () => void;
  spotifyConnected: boolean;
  spotifyError: string | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentSong, setCurrentSong] = useState<SongView | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<SongView[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyProduct, setSpotifyProduct] = useState<string | null>(null);
  const spotifyError: string | null = null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const historyRecordedRef = useRef(false);
  const queueRef = useRef<SongView[]>([]);
  const currentIndexRef = useRef(-1);
  const currentSongRef = useRef<SongView | null>(null);
  useEffect(() => {
    queueRef.current = queue;
    currentIndexRef.current = currentIndex;
    currentSongRef.current = currentSong;
  }, [queue, currentIndex, currentSong]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSpotifyConnected(false);
      setSpotifyProduct(null);
      return;
    }
    spotifyService.getStatus().then((status) => {
      setSpotifyConnected(status.connected);
      setSpotifyProduct(status.product || null);
    }).catch(() => {
      setSpotifyConnected(false);
      setSpotifyProduct(null);
    });
  }, [isAuthenticated]);

  const describeAudioError = (audio: HTMLAudioElement) => {
    if (audio.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      return 'This track has an unsupported or unavailable audio format.';
    }
    if (audio.error?.code === MediaError.MEDIA_ERR_NETWORK) {
      return 'The audio host could not be reached. Check your connection and retry.';
    }
    return 'The audio source could not be loaded. Please retry.';
  };

  const playLocalAudio = useCallback((song: SongView) => {
    const audio = audioRef.current;
    if (!audio || !song.audioUrl) {
      setPlaybackStatus('error');
      setPlaybackError('This track has no playable audio source.');
      setIsPlaying(false);
      return;
    }
    setPlaybackError(null);
    setPlaybackStatus('loading');
    audio.src = song.audioUrl;
    audio.load();
    void audio.play().then(() => {
      setIsPlaying(true);
      setPlaybackStatus('playing');
    }).catch((error: unknown) => {
      setIsPlaying(false);
      setPlaybackStatus('error');
      setPlaybackError(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Playback was blocked by the browser. Press play again to allow audio.'
        : describeAudioError(audio));
    });
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;
    const onLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : currentSongRef.current?.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onWaiting = () => setPlaybackStatus('loading');
    const onPlaying = () => {
      setPlaybackStatus('playing');
      setPlaybackError(null);
      setIsPlaying(true);
    };
    const onPause = () => {
      if (!audio.ended) {
        setPlaybackStatus('paused');
        setIsPlaying(false);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setPlaybackStatus('paused');
      if (currentIndexRef.current >= 0 && currentIndexRef.current < queueRef.current.length - 1) {
        const nextIndex = currentIndexRef.current + 1;
        setCurrentIndex(nextIndex);
        setCurrentSong(queueRef.current[nextIndex]);
        historyRecordedRef.current = false;
        playLocalAudio(queueRef.current[nextIndex]);
      }
    };
    const onError = () => {
      setIsPlaying(false);
      setPlaybackStatus('error');
      setPlaybackError(describeAudioError(audio));
    };
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [playLocalAudio]);

  useEffect(() => {
    if (isAuthenticated && currentSong && currentSong.id > 0 && !historyRecordedRef.current &&
      duration > 0 && currentTime / duration >= 0.75) {
      historyRecordedRef.current = true;
      historyService.recordHistory({
        songId: currentSong.id,
        completionPercentage: 80,
        selectedMood: activeMood || undefined,
      }).catch(() => {});
    }
  }, [currentTime, duration, currentSong, isAuthenticated, activeMood]);

  const playSong = useCallback((song: SongView, newQueue?: SongView[], moodContext?: string) => {
    const nextQueue = newQueue && newQueue.length > 0 ? newQueue : [song];
    const index = nextQueue.findIndex((item) => item.id === song.id);
    setQueue(nextQueue);
    setCurrentIndex(index >= 0 ? index : 0);
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 0);
    setPlaybackError(null);
    historyRecordedRef.current = false;
    if (moodContext) setActiveMood(moodContext);

    if (song.audioUrl) {
      playLocalAudio(song);
      return;
    }
    if (song.spotifyTrackId || song.spotifyUri) {
      setPlaybackStatus('error');
      setPlaybackError(spotifyConnected && spotifyProduct === 'premium'
        ? 'Spotify playback is available after connecting a Premium account.'
        : 'This Spotify track has no local preview. Connect Spotify later to play it.');
      setIsPlaying(false);
      return;
    }
    setPlaybackStatus('error');
    setPlaybackError('This track has no playable audio source.');
    setIsPlaying(false);
  }, [playLocalAudio, spotifyConnected, spotifyProduct]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!currentSong || !audio) return;
    if (isPlaying) {
      audio.pause();
    } else if (audio.src) {
      setPlaybackStatus('loading');
      void audio.play().catch(() => {
        setPlaybackStatus('error');
        setPlaybackError('Playback was blocked by the browser. Press play again to allow audio.');
      });
    } else {
      playLocalAudio(currentSong);
    }
  }, [currentSong, isPlaying, playLocalAudio]);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const resume = useCallback(() => {
    if (audioRef.current && currentSong) void audioRef.current.play().catch(() => setPlaybackError('Playback was blocked by the browser. Press play again to allow audio.'));
  }, [currentSong]);
  const next = useCallback(() => {
    if (currentIndex < queue.length - 1) playSong(queue[currentIndex + 1], queue, activeMood || undefined);
  }, [currentIndex, queue, playSong, activeMood]);
  const seek = useCallback((percentage: number) => {
    const target = Math.max(0, Math.min(100, percentage)) / 100 * duration;
    if (audioRef.current) audioRef.current.currentTime = target;
    setCurrentTime(target);
  }, [duration]);
  const prev = useCallback(() => {
    if (currentTime > 3) seek(0);
    else if (currentIndex > 0) playSong(queue[currentIndex - 1], queue, activeMood || undefined);
  }, [currentIndex, currentTime, queue, playSong, activeMood, seek]);
  const setVolume = useCallback((value: number) => {
    const next = Math.max(0, Math.min(1, value));
    setVolumeState(next);
    setIsMuted(next === 0);
    if (audioRef.current) audioRef.current.volume = next;
  }, []);
  const toggleMute = useCallback(() => {
    const muted = !isMuted;
    setIsMuted(muted);
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [isMuted, volume]);
  const retry = useCallback(() => { if (currentSong) playLocalAudio(currentSong); }, [currentSong, playLocalAudio]);
  const openLyrics = useCallback(() => setIsLyricsOpen(true), []);
  const closeLyrics = useCallback(() => setIsLyricsOpen(false), []);
  const toggleLyrics = useCallback(() => setIsLyricsOpen((value) => !value), []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, queue, currentIndex,
      progress: duration > 0 ? Math.min(100, currentTime / duration * 100) : 0,
      currentTime, duration, volume, isMuted, isLyricsOpen, activeMood,
      playbackStatus, playbackError, setActiveMood, playSong, togglePlay, pause, resume,
      next, prev, seek, setVolume, toggleMute, retry, openLyrics, closeLyrics, toggleLyrics,
      spotifyConnected, spotifyError,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
}
