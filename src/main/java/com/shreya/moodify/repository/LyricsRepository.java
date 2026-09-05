package com.shreya.moodify.repository;

import com.shreya.moodify.entity.Lyrics;
import com.shreya.moodify.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LyricsRepository extends JpaRepository<Lyrics, Long> {
    List<Lyrics> findBySong(Song s);
    Optional<Lyrics> findBySongAndLanguageIgnoreCase(Song s, String language);
    void deleteBySong(Song s);
}
