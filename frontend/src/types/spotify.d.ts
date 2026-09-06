interface SpotifyTrackState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: {
      id: string;
      name: string;
      uri: string;
    } | null;
  };
}

interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  activateElement(): Promise<void>;
  togglePlay(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  addListener(event: string, callback: (data: any) => void): boolean;
  removeListener(event: string): boolean;
}

interface SpotifyPlayerConstructorOptions {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyNamespace {
  Player: new (options: SpotifyPlayerConstructorOptions) => SpotifyPlayer;
}

interface Window {
  Spotify?: SpotifyNamespace;
  onSpotifyWebPlaybackSDKReady?: () => void;
}
