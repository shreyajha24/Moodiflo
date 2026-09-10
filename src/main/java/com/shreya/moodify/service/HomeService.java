package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.discovery.DiscoveryService;
import com.shreya.moodify.entity.*;
import com.shreya.moodify.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class HomeService {

    private final MoodService moods;
    private final SpotifyService spotify;
    private final UserRepository userRepo;
    private final HistoryRepository historyRepo;
    private final SongService songService;
    private final DiscoveryService discoveryService;

    public HomeService(MoodService moods,
                       SpotifyService spotify,
                       UserRepository userRepo,
                       HistoryRepository historyRepo,
                       SongService songService, DiscoveryService discoveryService) {
        this.moods = moods;
        this.spotify = spotify;
        this.userRepo = userRepo;
        this.historyRepo = historyRepo;
        this.songService = songService;
        this.discoveryService = discoveryService;
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

        // 3. Suggested Mood
        String suggestedMood = determineSuggestedMood(history);

        // 4. Continue Listening (< 90% completion)
        List<SongView> continueListening = history.stream()
                .filter(h -> h.getCompletionPercentage() != null && h.getCompletionPercentage() < 90)
                .map(h -> h.getSong())
                .filter(this::isNotLegacyDemoSong)
                .distinct()
                .limit(10)
                .map(songService::view)
                .toList();

        // 5. Recently Played (Distinct)
        List<SongView> recentlyPlayed = history.stream()
                .map(h -> h.getSong())
                .filter(this::isNotLegacyDemoSong)
                .distinct()
                .limit(10)
                .map(songService::view)
                .toList();

        // 6. Because You Listened (based on most recent song's genre/mood)
        // Spotify is the only discovery source for Home. The database history
        // above is retained only for user context and is never used as a
        // discovery fallback.
        List<SongView> spotifyMoodTracks = discoveryService.discoverMood(suggestedMood, email, 20);
        if (spotifyMoodTracks.isEmpty()) spotifyMoodTracks = spotify.searchByMood(suggestedMood, email, 0, 20);
        List<SongView> becauseYouListened = spotifyMoodTracks.stream().limit(8).toList();
        List<SongView> recommendedForYou = spotifyMoodTracks.stream().limit(10).toList();
        List<SongView> trending = spotifyMoodTracks.stream().skip(10).limit(10).toList();

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

    private boolean isNotLegacyDemoSong(Song song) {
        String title = song.getTitle() == null ? "" : song.getTitle();
        String artist = song.getArtist() == null ? "" : song.getArtist();
        String description = song.getDescription() == null ? "" : song.getDescription();
        return !title.regionMatches(true, 0, "Moodify Demo", 0, "Moodify Demo".length())
                && !artist.regionMatches(true, 0, "Demo Artist", 0, "Demo Artist".length())
                && !description.toLowerCase().contains("demo audio");
    }
}
