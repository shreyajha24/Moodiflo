package com.shreya.moodify.service;

import com.shreya.moodify.entity.Mood;
import com.shreya.moodify.entity.Song;
import com.shreya.moodify.repository.FavoriteRepository;
import com.shreya.moodify.repository.HistoryRepository;
import com.shreya.moodify.repository.LyricsRepository;
import com.shreya.moodify.repository.MoodRepository;
import com.shreya.moodify.repository.PlaylistSongRepository;
import com.shreya.moodify.repository.SongMoodRepository;
import com.shreya.moodify.repository.SongRepository;
import com.shreya.moodify.repository.TranslationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Owns startup database work and its transaction boundary. */
@Service
public class StartupDataService {

    private final MoodRepository moods;
    private final SongRepository songs;
    private final SongMoodRepository songMoods;
    private final LyricsRepository lyrics;
    private final TranslationRepository translations;
    private final FavoriteRepository favorites;
    private final HistoryRepository history;
    private final PlaylistSongRepository playlistSongs;

    public StartupDataService(MoodRepository moods,
                              SongRepository songs,
                              SongMoodRepository songMoods,
                              LyricsRepository lyrics,
                              TranslationRepository translations,
                              FavoriteRepository favorites,
                              HistoryRepository history,
                              PlaylistSongRepository playlistSongs) {
        this.moods = moods;
        this.songs = songs;
        this.songMoods = songMoods;
        this.lyrics = lyrics;
        this.translations = translations;
        this.favorites = favorites;
        this.history = history;
        this.playlistSongs = playlistSongs;
    }

    /*
     * Normal startup only ensures required reference metadata exists. It must
     * never mutate user accounts or the application catalog.
     *
     * Legacy catalog cleanup is deliberately kept out of the normal startup
     * path. It is exposed only through the separately conditional maintenance
     * runner in SeedDataConfig.
     */
    @Transactional
    public void initialize() {
        seedMoodsIfEmpty();
    }

    /**
     * Explicit one-time maintenance operation. It is not called by normal
     * startup and is only wired by SeedDataConfig when the operator explicitly
     * enables PURGE_LEGACY_DEMO_DATA.
     */
    @Transactional
    public void purgeLegacyDemoSongs() {
        songs.findAll().stream()
                .filter(this::isLegacyDemoSong)
                .forEach(song -> {
                    songMoods.deleteBySong(song);
                    lyrics.deleteBySong(song);
                    translations.deleteBySong(song);
                    favorites.deleteBySong(song);
                    history.deleteBySong(song);
                    playlistSongs.deleteBySong(song);
                    songs.delete(song);
                });
        songs.flush();
    }

    private void seedMoodsIfEmpty() {
        if (moods.count() != 0) return;

        String[] names = {"HAPPY", "CALM", "ENERGETIC", "SAD", "ROMANTIC", "NOSTALGIC",
                "FOCUS", "ANGRY", "DREAMY", "MELANCHOLIC", "PARTY", "HOPEFUL"};
        for (String name : names) {
            Mood mood = new Mood();
            mood.setName(name);
            mood.setDescription("Songs that meet your " + name.toLowerCase() + " mood.");
            mood.setEmoji("♪");
            mood.setRecommendedGenres("Indie,Acoustic,Pop");
            moods.save(mood);
        }
    }

    private boolean isLegacyDemoSong(Song song) {
        String title = song.getTitle() == null ? "" : song.getTitle();
        String artist = song.getArtist() == null ? "" : song.getArtist();
        String description = song.getDescription() == null ? "" : song.getDescription();
        return title.regionMatches(true, 0, "Moodify Demo", 0, "Moodify Demo".length())
                || artist.regionMatches(true, 0, "Demo Artist", 0, "Demo Artist".length())
                || description.toLowerCase().contains("demo audio");
    }

}
