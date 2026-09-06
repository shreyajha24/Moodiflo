import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { PlayerBar } from '../components/common/PlayerBar';
import { MobileNav } from '../components/common/MobileNav';
import { LyricsModal } from '../components/common/LyricsModal';
import { Footer } from '../components/common/Footer';
import { AddToPlaylistModal } from '../components/common/AddToPlaylistModal';
import type { SongView } from '../types';
import { usePlayer } from '../hooks/usePlayer';
import { getMoodTheme } from '../utils/moodTheme';

export const RootLayout: React.FC = () => {
  const [playlistModalSong, setPlaylistModalSong] = useState<SongView | null>(null);
  const { activeMood } = usePlayer();
  const theme = getMoodTheme(activeMood || 'HAPPY');

  return (
    <div className="min-h-screen w-full bg-[#0b0c10] text-slate-100 antialiased relative selection:bg-amber-400/30 selection:text-amber-200">
      {/* Atmospheric Ambient Aura that gently reacts to current mood */}
      <div
        className="ambient-aura"
        style={{
          background: theme.ambientGradient,
        }}
      />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 px-4 sm:px-8 py-6 pb-40 md:pb-32">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ openAddToPlaylist: setPlaylistModalSong }} />
            <Footer />
          </div>
        </main>

        {/* Floating Player & Overlays */}
        <PlayerBar />
        <MobileNav />
        <LyricsModal />

        {/* Add to Playlist Dialog */}
        <AddToPlaylistModal
          song={playlistModalSong}
          isOpen={!!playlistModalSong}
          onClose={() => setPlaylistModalSong(null)}
        />
      </div>
    </div>
  );
};
