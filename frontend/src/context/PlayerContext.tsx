import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { SongView } from '../types';
import { historyService } from '../services/historyService';
import { useAuth } from './AuthContext';

interface PlayerContextType {
  currentSong: SongView | null;
  isPlaying: boolean;
  queue: SongView[];
  currentIndex: number;
  progress: number; // 0 - 100
  currentTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0 - 1
  isMuted: boolean;
  isLyricsOpen: boolean;
  activeMood: string | null;
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
  openLyrics: () => void;
  closeLyrics: () => void;
  toggleLyrics: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentSong, setCurrentSong] = useState<SongView | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [queue, setQueue] = useState<SongView[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simulatedTimerRef = useRef<number | null>(null);
  const isSimulatedRef = useRef<boolean>(false);
  const historyRecordedRef = useRef<boolean>(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!isSimulatedRef.current && audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleSongCompleted();
    };

    const handleError = () => {
      // If audio fails to load (e.g. example.com dummy URL), fallback to simulated playback
      isSimulatedRef.current = true;
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      if (simulatedTimerRef.current) {
        clearInterval(simulatedTimerRef.current);
      }
    };
  }, []);

  // Handle simulated playback when real audio is dummy/invalid URL
  useEffect(() => {
    if (isPlaying) {
      simulatedTimerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const songDuration = currentSong?.duration || 180;
          if (prev >= songDuration) {
            handleSongCompleted();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (simulatedTimerRef.current) {
        clearInterval(simulatedTimerRef.current);
        simulatedTimerRef.current = null;
      }
    }

    return () => {
      if (simulatedTimerRef.current) {
        clearInterval(simulatedTimerRef.current);
        simulatedTimerRef.current = null;
      }
    };
  }, [isPlaying, currentSong]);

  // Record history when passing 80%
  useEffect(() => {
    if (
      isAuthenticated &&
      currentSong &&
      !historyRecordedRef.current &&
      duration > 0 &&
      (currentTime / duration) >= 0.75
    ) {
      historyRecordedRef.current = true;
      historyService.recordHistory({
        songId: currentSong.id,
        completionPercentage: 80,
        selectedMood: activeMood || undefined,
      }).catch(() => {
        // silent fail for non-critical logging
      });
    }
  }, [currentTime, duration, currentSong, isAuthenticated, activeMood]);

  const handleSongCompleted = useCallback(() => {
    if (isAuthenticated && currentSong) {
      historyService.recordHistory({
        songId: currentSong.id,
        completionPercentage: 100,
        selectedMood: activeMood || undefined,
      }).catch(() => {});
    }

    // Auto next track
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextSong = queue[nextIdx];
      setCurrentIndex(nextIdx);
      setCurrentSong(nextSong);
      setCurrentTime(0);
      setDuration(nextSong.duration || 180);
      historyRecordedRef.current = false;
      if (audioRef.current && nextSong.audioUrl) {
        audioRef.current.src = nextSong.audioUrl;
        audioRef.current.play().catch(() => {
          isSimulatedRef.current = true;
        });
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentIndex, currentSong, isAuthenticated, queue, activeMood]);

  const playSong = useCallback((song: SongView, newQueue?: SongView[], moodContext?: string) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 180);
    historyRecordedRef.current = false;
    isSimulatedRef.current = false;
    if (moodContext) {
      setActiveMood(moodContext);
    }

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((s) => s.id === song.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([song]);
      setCurrentIndex(0);
    }

    if (audioRef.current && song.audioUrl) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch(() => {
        isSimulatedRef.current = true;
      });
    } else {
      isSimulatedRef.current = true;
    }

    setIsPlaying(true);
  }, [isMuted, queue.length, volume]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!isSimulatedRef.current && audioRef.current && currentSong.audioUrl) {
        audioRef.current.play().catch(() => {
          isSimulatedRef.current = true;
        });
      }
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (!currentSong) return;
    if (!isSimulatedRef.current && audioRef.current && currentSong.audioUrl) {
      audioRef.current.play().catch(() => {
        isSimulatedRef.current = true;
      });
    }
    setIsPlaying(true);
  }, [currentSong]);

  const next = useCallback(() => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      playSong(queue[nextIdx], queue, activeMood || undefined);
    }
  }, [currentIndex, queue, playSong, activeMood]);

  const prev = useCallback(() => {
    if (currentTime > 3) {
      seek(0);
    } else if (queue.length > 0 && currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      playSong(queue[prevIdx], queue, activeMood || undefined);
    }
  }, [currentIndex, currentTime, queue, playSong, activeMood]);

  const seek = useCallback((percentage: number) => {
    const targetTime = (percentage / 100) * duration;
    setCurrentTime(targetTime);
    if (audioRef.current && !isSimulatedRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  }, [isMuted, volume]);

  const openLyrics = useCallback(() => setIsLyricsOpen(true), []);
  const closeLyrics = useCallback(() => setIsLyricsOpen(false), []);
  const toggleLyrics = useCallback(() => setIsLyricsOpen((prev) => !prev), []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        progress,
        currentTime,
        duration,
        volume,
        isMuted,
        isLyricsOpen,
        activeMood,
        setActiveMood,
        playSong,
        togglePlay,
        pause,
        resume,
        next,
        prev,
        seek,
        setVolume,
        toggleMute,
        openLyrics,
        closeLyrics,
        toggleLyrics,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
