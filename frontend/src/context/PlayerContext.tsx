import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { SongView } from '../types';
import { historyService } from '../services/historyService';
import { useAuth } from './AuthContext';
import { spotifyService } from '../services/spotifyService';

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
  spotifyConnected: boolean;
  spotifyError: string | null;
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
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simulatedTimerRef = useRef<number | null>(null);
  const isSimulatedRef = useRef<boolean>(false);
  const historyRecordedRef = useRef<boolean>(false);
  const spotifyPlayerRef = useRef<SpotifyPlayer | null>(null);
  const spotifyDeviceIdRef = useRef<string | null>(null);
  const spotifyTokenRef = useRef<string | null>(null);
  const spotifyInitRef = useRef<Promise<SpotifyPlayer> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSpotifyConnected(false);
      spotifyPlayerRef.current?.disconnect();
      spotifyPlayerRef.current = null;
      spotifyInitRef.current = null;
      spotifyTokenRef.current = null;
      return;
    }
    spotifyService.getStatus().then((status) => setSpotifyConnected(status.connected)).catch(() => setSpotifyConnected(false));
  }, [isAuthenticated]);

  const ensureSpotifyPlayer = useCallback(async (): Promise<SpotifyPlayer> => {
    if (spotifyPlayerRef.current) return spotifyPlayerRef.current;
    if (spotifyInitRef.current) return spotifyInitRef.current;

    spotifyInitRef.current = (async () => {
      const token = await spotifyService.getAccessToken();
      spotifyTokenRef.current = token;
      if (!window.Spotify) {
        await new Promise<void>((resolve, reject) => {
          const previous = window.onSpotifyWebPlaybackSDKReady;
          window.onSpotifyWebPlaybackSDKReady = () => {
            previous?.();
            resolve();
          };
          const script = document.createElement('script');
          script.src = 'https://sdk.scdn.co/spotify-player.js';
          script.async = true;
          script.onerror = () => reject(new Error('Unable to load Spotify playback.'));
          document.body.appendChild(script);
        });
      }
      if (!window.Spotify) throw new Error('Spotify playback is unavailable.');

      const player = new window.Spotify.Player({
        name: 'Moodiflo Web Player',
        volume: isMuted ? 0 : volume,
        getOAuthToken: (callback) => {
          spotifyService.getAccessToken().then((nextToken) => {
            spotifyTokenRef.current = nextToken;
            callback(nextToken);
          }).catch(() => callback(spotifyTokenRef.current || ''));
        },
      });
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        spotifyDeviceIdRef.current = device_id;
      });
      player.addListener('not_ready', () => {
        spotifyDeviceIdRef.current = null;
      });
      player.addListener('initialization_error', ({ message }: { message: string }) => setSpotifyError(message));
      player.addListener('authentication_error', () => setSpotifyError('Spotify connection expired. Please reconnect Spotify.'));
      player.addListener('account_error', () => setSpotifyError('Spotify Premium is required for in-browser playback.'));
      player.addListener('playback_error', ({ message }: { message: string }) => setSpotifyError(message));
      player.addListener('player_state_changed', (state: SpotifyTrackState | null) => {
        if (!state) return;
        setCurrentTime(state.position / 1000);
        setDuration(state.duration / 1000);
        setIsPlaying(!state.paused);
      });
      const connected = await player.connect();
      if (!connected) throw new Error('Spotify player could not connect.');
      for (let attempt = 0; attempt < 50 && !spotifyDeviceIdRef.current; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }
      if (!spotifyDeviceIdRef.current) throw new Error('Spotify playback device did not become ready.');
      spotifyPlayerRef.current = player;
      setSpotifyError(null);
      return player;
    })();

    try {
      return await spotifyInitRef.current;
    } catch (error) {
      spotifyInitRef.current = null;
      throw error;
    }
  }, [isMuted, volume]);

  const playSpotifyTrack = useCallback(async (song: SongView) => {
    try {
      const player = await ensureSpotifyPlayer();
      await player.activateElement();
      const token = spotifyTokenRef.current || await spotifyService.getAccessToken();
      spotifyTokenRef.current = token;
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(spotifyDeviceIdRef.current || '')}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: [song.spotifyUri || `spotify:track:${song.spotifyTrackId}`] }),
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Spotify Premium is required for in-browser playback.');
        throw new Error('Spotify could not start playback.');
      }
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      setSpotifyError(error instanceof Error ? error.message : 'Unable to start Spotify playback.');
    }
  }, [ensureSpotifyPlayer]);

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
      currentSong.id > 0 &&
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
    if (isAuthenticated && currentSong && currentSong.id > 0) {
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

    if (song.spotifyTrackId || song.spotifyUri) {
      void playSpotifyTrack(song);
    } else if (audioRef.current && song.audioUrl) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch(() => {
        isSimulatedRef.current = true;
      });
    } else {
      isSimulatedRef.current = true;
    }

    setIsPlaying(true);
  }, [isMuted, playSpotifyTrack, queue.length, volume]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;

    if (isPlaying) {
      if (currentSong.spotifyTrackId || currentSong.spotifyUri) {
        void spotifyPlayerRef.current?.pause();
      } else {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    } else {
      if (currentSong.spotifyTrackId || currentSong.spotifyUri) {
        void spotifyPlayerRef.current?.resume();
      } else if (!isSimulatedRef.current && audioRef.current && currentSong.audioUrl) {
        audioRef.current.play().catch(() => {
          isSimulatedRef.current = true;
        });
      }
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying]);

  const pause = useCallback(() => {
    if (currentSong?.spotifyTrackId || currentSong?.spotifyUri) void spotifyPlayerRef.current?.pause();
    else audioRef.current?.pause();
    setIsPlaying(false);
  }, [currentSong]);

  const resume = useCallback(() => {
    if (!currentSong) return;
    if (currentSong.spotifyTrackId || currentSong.spotifyUri) {
      void spotifyPlayerRef.current?.resume();
    } else if (!isSimulatedRef.current && audioRef.current && currentSong.audioUrl) {
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
    if (currentSong?.spotifyTrackId || currentSong?.spotifyUri) {
      void spotifyPlayerRef.current?.seek(targetTime * 1000);
    } else if (audioRef.current && !isSimulatedRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  }, [currentSong, duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    void spotifyPlayerRef.current?.setVolume(clamped);
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
        spotifyConnected,
        spotifyError,
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
