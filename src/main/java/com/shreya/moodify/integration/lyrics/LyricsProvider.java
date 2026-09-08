package com.shreya.moodify.integration.lyrics;

import com.shreya.moodify.entity.Song;

import java.util.Optional;

public interface LyricsProvider {
    Optional<ProvidedLyrics> find(Song song);

    record ProvidedLyrics(String language, String text) {}
}
