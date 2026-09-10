import { useEffect, useRef, useState, useCallback } from 'react';
import { spotifyService } from '../services/spotifyService';

export interface UseSpotifyPlayerReturn {
  isSdkReady: boolean;
  deviceId: string | null;
  playerError: string | null;
  playSpotifyTrack: (spotifyUri: string) => Promise<boolean>;
  toggleSpotifyPlay: () => Promise<void>;
  pauseSpotify: () => Promise<void>;
  resumeSpotify: () => Promise<void>;
  seekSpotify: (positionMs: number) => Promise<void>;
  setSpotifyVolume: (vol: number) => Promise<void>;
}

export function useSpotifyPlayer(
  enabled: boolean,
  isPremium: boolean,
  onStateChange?: (state: SpotifyTrackState | null) => void
): UseSpotifyPlayerReturn {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const playerRef = useRef<SpotifyPlayer | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !isPremium) {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
      setDeviceId(null);
      setIsSdkReady(false);
      return;
    }

    let isMounted = true;

    const setupPlayer = () => {
      if (!window.Spotify || playerRef.current) return;

      const player = new window.Spotify.Player({
        name: 'Moodiflo Web Player',
        getOAuthToken: async (cb) => {
          try {
            const token = await spotifyService.getAccessToken();
            tokenRef.current = token;
            cb(token);
          } catch {
            setPlayerError('Could not refresh Spotify session.');
          }
        },
        volume: 0.8,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        if (!isMounted) return;
        setDeviceId(device_id);
        setIsSdkReady(true);
        setPlayerError(null);
      });

      player.addListener('not_ready', () => {
        if (!isMounted) return;
        setDeviceId(null);
        setIsSdkReady(false);
      });

      player.addListener('player_state_changed', (state: SpotifyTrackState | null) => {
        if (!isMounted) return;
        if (onStateChange) onStateChange(state);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        if (!isMounted) return;
        setPlayerError(`Spotify init error: ${message}`);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        if (!isMounted) return;
        setPlayerError(`Spotify auth error: ${message}`);
      });

      player.addListener('account_error', () => {
        if (!isMounted) return;
        setPlayerError('Spotify Premium is required for in-browser playback.');
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        if (!isMounted) return;
        setPlayerError(`Spotify playback error: ${message}`);
      });

      player.addListener('autoplay_failed', () => {
        if (!isMounted) return;
        setPlayerError('Browser audio activation was blocked. Press Play again.');
      });

      player.connect().then((success: boolean) => {
        if (!isMounted) return;
        if (!success) {
          setPlayerError('Failed to initialize Spotify Web Player.');
        }
      });

      playerRef.current = player;
    };

    if (window.Spotify) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = setupPlayer;
      if (!document.getElementById('spotify-player-sdk')) {
        const script = document.createElement('script');
        script.id = 'spotify-player-sdk';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [enabled, isPremium, onStateChange]);

  const playSpotifyTrack = useCallback(async (spotifyUri: string): Promise<boolean> => {
    if (!spotifyUri.startsWith('spotify:track:')) {
      setPlayerError('Spotify playback requires a valid Spotify track URI.');
      return false;
    }
    if (!deviceId || !playerRef.current) {
      setPlayerError('Spotify player device is not ready.');
      return false;
    }
    try {
      // Must happen from the user's Play gesture for browsers that gate audio.
      await playerRef.current.activateElement();
      const token = tokenRef.current || (await spotifyService.getAccessToken());
      tokenRef.current = token;

      const play = (accessToken: string) => fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: [spotifyUri] }),
      });
      let response = await play(token);
      if (response.status === 401) {
        tokenRef.current = null;
        const refreshed = await spotifyService.getAccessToken();
        tokenRef.current = refreshed;
        response = await play(refreshed);
      }

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        const reason = (errorData as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
        setPlayerError(`Spotify play failed: ${reason}`);
        return false;
      }

      setPlayerError(null);
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[Spotify] playback request failed', err);
      setPlayerError(err instanceof Error ? err.message : 'Failed to trigger Spotify playback.');
      return false;
    }
  }, [deviceId]);

  const toggleSpotifyPlay = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.togglePlay();
    }
  }, []);

  const pauseSpotify = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.pause();
    }
  }, []);

  const resumeSpotify = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.resume();
    }
  }, []);

  const seekSpotify = useCallback(async (positionMs: number) => {
    if (playerRef.current) {
      await playerRef.current.seek(positionMs);
    }
  }, []);

  const setSpotifyVolume = useCallback(async (vol: number) => {
    if (playerRef.current) {
      await playerRef.current.setVolume(vol);
    }
  }, []);

  return {
    isSdkReady,
    deviceId,
    playerError,
    playSpotifyTrack,
    toggleSpotifyPlay,
    pauseSpotify,
    resumeSpotify,
    seekSpotify,
    setSpotifyVolume,
  };
}
