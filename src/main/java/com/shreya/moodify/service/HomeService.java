package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.*;
import com.shreya.moodify.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class HomeService {

    private final MoodService moods;
    private final RecommendationService recommendationService;
    private final UserRepository userRepo;
    private final HistoryRepository historyRepo;
    private final SongRepository songRepo;
    private final SongService songService;

    public HomeService(MoodService moods,
                       RecommendationService recommendationService,
                       UserRepository userRepo,
                       HistoryRepository historyRepo,
                       SongRepository songRepo,
                       SongService songService) {
        this.moods = moods;
        this.recommendationService = recommendationService;
        this.userRepo = userRepo;
        this.historyRepo = historyRepo;
        this.songRepo = songRepo;
        this.songService = songService;
    }

    public DiscoveryResponse home(String email) {
        Optional<User> userOpt = email != null ? userRepo.findByEmailIgnoreCase(email) : Optional.empty();

        // 1. Personalized Greeting
        String greeting = generateGreeting(userOpt.orElse(null));

        // 2. Mood Cards
        List<MoodView> moodCards = moods.all();

        // Fetch User Listening History
        List<ListeningHistory> history = userOpt.isPresent()
                ? historyRepo.findTop20ByUserOrderByPlayedAtDesc(userOpt.get())
                : List.of();

        Set<Long> playedSongIds = history.stream()
                .map(h -> h.getSong().getId())
                .collect(Collectors.toSet());

        // 3. Suggested Mood
        String suggestedMood = determineSuggestedMood(history);

        // 4. Continue Listening (< 90% completion)
        List<SongView> continueListening = history.stream()
                .filter(h -> h.getCompletionPercentage() != null && h.getCompletionPercentage() < 90)
                .map(h -> h.getSong())
                .distinct()
                .limit(10)
                .map(songService::view)
                .toList();

        // 5. Recently Played (Distinct)
        List<SongView> recentlyPlayed = history.stream()
                .map(h -> h.getSong())
                .distinct()
                .limit(10)
                .map(songService::view)
                .toList();

        // 6. Because You Listened (based on most recent song's genre/mood)
        List<SongView> becauseYouListened = determineBecauseYouListened(history, playedSongIds, suggestedMood);

        // 7. Recommended For You (Personalized)
        List<SongView> recommendedForYou = recommendationService.recommendPersonalized(email, 10);

        // 8. Trending Songs
        List<SongView> trending = recommendationService.getTrending(10);

        return new DiscoveryResponse(
                greeting,
                suggestedMood,
                moodCards,
                continueListening,
                becauseYouListened,
                recentlyPlayed,
                recommendedForYou,
                trending
        );
    }

    private String generateGreeting(User user) {
        int hour = LocalTime.now().getHour();
        String timeGreeting;
        if (hour >= 5 && hour < 12) {
            timeGreeting = "Good morning";
        } else if (hour >= 12 && hour < 17) {
            timeGreeting = "Good afternoon";
        } else if (hour >= 17 && hour < 22) {
            timeGreeting = "Good evening";
        } else {
            timeGreeting = "Good night";
        }

        if (user != null && user.getName() != null && !user.getName().isBlank()) {
            return timeGreeting + ", " + user.getName() + "!";
        }
        return timeGreeting + "!";
    }

    private String determineSuggestedMood(List<ListeningHistory> history) {
        // If history has a selectedMood, use the most recent one
        for (ListeningHistory h : history) {
            if (h.getSelectedMood() != null && h.getSelectedMood().getName() != null) {
                return h.getSelectedMood().getName().toUpperCase();
            }
        }

        // Time-based mood suggestion
        int hour = LocalTime.now().getHour();
        if (hour >= 5 && hour < 12) {
            return "ENERGETIC";
        } else if (hour >= 12 && hour < 17) {
            return "FOCUS";
        } else if (hour >= 17 && hour < 22) {
            return "CALM";
        } else {
            return "DREAMY";
        }
    }

    private List<SongView> determineBecauseYouListened(List<ListeningHistory> history,
                                                      Set<Long> playedSongIds,
                                                      String fallbackMood) {
        if (!history.isEmpty()) {
            Song recentSong = history.get(0).getSong();
            if (recentSong.getGenre() != null && !recentSong.getGenre().isBlank()) {
                List<Song> genreMatches = songRepo.findByGenreIgnoreCase(recentSong.getGenre());
                List<SongView> unplayedMatches = genreMatches.stream()
                        .filter(s -> !playedSongIds.contains(s.getId()))
                        .limit(8)
                        .map(songService::view)
                        .toList();

                if (!unplayedMatches.isEmpty()) {
                    return unplayedMatches;
                }
            }
        }

        // Fallback: recommend songs matching suggested mood
        return recommendationService.recommendForMood(fallbackMood, null, null, 8);
    }
}
