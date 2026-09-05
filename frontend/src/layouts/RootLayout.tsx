import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-slate-100 antialiased">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-36 md:pb-28">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ openAddToPlaylist: setPlaylistModalSong }} />
            <Footer />
          </div>
        </main>
      </div>

      {/* Fixed Elements */}
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
  );
};
