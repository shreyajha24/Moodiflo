package com.shreya.moodify.service;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.*;
import com.shreya.moodify.exception.ApiExceptions.NotFound;
import com.shreya.moodify.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private final SongRepository songRepo;
    private final MoodRepository moodRepo;
    private final SongMoodRepository songMoodRepo;
    private final FavoriteRepository favoriteRepo;
    private final HistoryRepository historyRepo;
    private final UserRepository userRepo;
    private final SongService songService;

    public RecommendationService(SongRepository songRepo,
                                 MoodRepository moodRepo,
                                 SongMoodRepository songMoodRepo,
                                 FavoriteRepository favoriteRepo,
                                 HistoryRepository historyRepo,
                                 UserRepository userRepo,
                                 SongService songService) {
        this.songRepo = songRepo;
        this.moodRepo = moodRepo;
        this.songMoodRepo = songMoodRepo;
        this.favoriteRepo = favoriteRepo;
        this.historyRepo = historyRepo;
        this.userRepo = userRepo;
        this.songService = songService;
    }

    /**
     * Recommends songs for a specific mood with optional language and intensity filters.
     */
    public List<SongView> recommendForMood(String moodName, String language, Double requestedIntensity, int limit) {
        Mood mood = moodRepo.findByNameIgnoreCase(moodName)
                .orElseThrow(() -> new NotFound("Mood not found"));

        List<SongMood> links = songMoodRepo.findByMoodOrderByMoodScoreDesc(mood);

        return links.stream()
                .sorted((a, b) -> {
                    double scoreA = calculateMoodSessionScore(a, mood, language, requestedIntensity);
                    double scoreB = calculateMoodSessionScore(b, mood, language, requestedIntensity);
                    return Double.compare(scoreB, scoreA);
                })
                .limit(limit)
                .map(sm -> songService.view(sm.getSong()))
                .toList();
    }

    private double calculateMoodSessionScore(SongMood sm, Mood mood, String requestedLanguage, Double requestedIntensity) {
        double score = sm.getMoodScore() != null ? sm.getMoodScore() : 0.5;

        // Language matching bonus
        if (requestedLanguage != null && !requestedLanguage.isBlank()) {
            if (sm.getSong().getLanguage() != null &&
                    sm.getSong().getLanguage().equalsIgnoreCase(requestedLanguage.trim())) {
                score += 0.3;
            }
        }

        // Intensity matching
        if (requestedIntensity != null && mood.getIntensity() != null) {
            double diff = Math.abs(requestedIntensity - mood.getIntensity());
            score += Math.max(0, 0.2 - diff * 0.2);
        }

        // Popularity weight (0.0 - 1.0)
        if (sm.getSong().getPopularity() != null) {
            score += sm.getSong().getPopularity() * 0.15;
        }

        return score;
    }

    /**
     * Deterministic personalized recommendations for an authenticated user.
     * Considers: favorites, listening history, preferred language, genre affinity, diversity.
     */
    public List<SongView> recommendPersonalized(String email, int limit) {
        Optional<User> userOpt = email != null ? userRepo.findByEmailIgnoreCase(email) : Optional.empty();
        if (userOpt.isEmpty()) {
            return getTrending(limit);
        }
        User user = userOpt.get();

        List<Favorite> favorites = favoriteRepo.findByUserOrderByCreatedAtDesc(user);
        List<ListeningHistory> history = historyRepo.findTop20ByUserOrderByPlayedAtDesc(user);

        Set<Long> favoriteSongIds = favorites.stream().map(f -> f.getSong().getId()).collect(Collectors.toSet());
        Set<Long> recentlyPlayedSongIds = history.stream().map(h -> h.getSong().getId()).collect(Collectors.toSet());

        // Extract preferred genres from favorites and history
        Map<String, Long> genreAffinity = new HashMap<>();
        for (Favorite f : favorites) {
            if (f.getSong().getGenre() != null) {
                genreAffinity.merge(f.getSong().getGenre().toLowerCase(), 2L, Long::sum);
            }
        }
        for (ListeningHistory h : history) {
            if (h.getSong().getGenre() != null) {
                genreAffinity.merge(h.getSong().getGenre().toLowerCase(), 1L, Long::sum);
            }
        }

        List<Song> allSongs = songRepo.findAll();

        return allSongs.stream()
                .sorted((s1, s2) -> {
                    double score1 = scorePersonalizedSong(s1, user, favoriteSongIds, recentlyPlayedSongIds, genreAffinity);
                    double score2 = scorePersonalizedSong(s2, user, favoriteSongIds, recentlyPlayedSongIds, genreAffinity);
                    return Double.compare(score2, score1);
                })
                .limit(limit)
                .map(songService::view)
                .toList();
    }

    private double scorePersonalizedSong(Song song, User user,
                                         Set<Long> favoriteSongIds,
                                         Set<Long> recentlyPlayedSongIds,
                                         Map<String, Long> genreAffinity) {
        double score = 0.0;

        // Base score from popularity
        if (song.getPopularity() != null) {
            score += song.getPopularity() * 0.5;
        }

        // Preferred language bonus
        if (user.getPreferredLanguage() != null && song.getLanguage() != null
                && user.getPreferredLanguage().equalsIgnoreCase(song.getLanguage())) {
            score += 0.3;
        }

        // Genre affinity
        if (song.getGenre() != null) {
            Long count = genreAffinity.get(song.getGenre().toLowerCase());
            if (count != null) {
                score += Math.min(0.4, count * 0.1);
            }
        }

        // Favorites bonus
        if (favoriteSongIds.contains(song.getId())) {
            score += 0.2;
        }

        // Diversity / freshness penalty: If already played in recent 20 songs, lower priority
        if (recentlyPlayedSongIds.contains(song.getId())) {
            score -= 0.35;
        }

        return score;
    }

    /**
     * Returns top trending songs ordered by popularity.
     */
    public List<SongView> getTrending(int limit) {
        return songRepo.findAll().stream()
                .sorted((a, b) -> Double.compare(
                        b.getPopularity() != null ? b.getPopularity() : 0.0,
                        a.getPopularity() != null ? a.getPopularity() : 0.0
                ))
                .limit(limit)
                .map(songService::view)
                .toList();
    }
}
