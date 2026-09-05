package com.shreya.moodify.repository;

import com.shreya.moodify.entity.Playlist;
import com.shreya.moodify.entity.PlaylistSong;
import com.shreya.moodify.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    List<PlaylistSong> findByPlaylistOrderByPositionAsc(Playlist p);
    Optional<PlaylistSong> findByPlaylistAndSong(Playlist p, Song s);
    void deleteBySong(Song s);
}
