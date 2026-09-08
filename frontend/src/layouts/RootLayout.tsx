import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { PlayerBar } from '../components/common/PlayerBar';
import { MobileNav } from '../components/common/MobileNav';
import { LyricsModal } from '../components/common/LyricsModal';
import { Footer } from '../components/common/Footer';
import { AddToPlaylistModal } from '../components/common/AddToPlaylistModal';
import type { SongView } from '../types';

export const RootLayout: React.FC = () => {
  const [playlistModalSong, setPlaylistModalSong] = useState<SongView | null>(null);

  return (
    <div className="app-shell">
      <div className="ambient-aura" aria-hidden="true" />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="app-main">
          <div>
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
