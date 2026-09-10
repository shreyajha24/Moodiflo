package com.shreya.moodify.discovery;

import com.shreya.moodify.dto.ApiDtos.SongView;
import com.shreya.moodify.entity.Favorite;
import com.shreya.moodify.entity.ListeningHistory;
import com.shreya.moodify.entity.Song;
import com.shreya.moodify.repository.FavoriteRepository;
import com.shreya.moodify.repository.HistoryRepository;
import com.shreya.moodify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DiscoveryService {
    private static final Logger log = LoggerFactory.getLogger(DiscoveryService.class);
    private static final Map<String, List<String>> MOOD_TAGS = Map.ofEntries(
            Map.entry("HAPPY", List.of("happy", "upbeat", "feel good", "cheerful", "pop")),
            Map.entry("CALM", List.of("calm", "relaxing", "peaceful", "ambient", "acoustic")),
            Map.entry("SAD", List.of("sad", "melancholy", "emotional", "heartbreak")),
            Map.entry("ENERGETIC", List.of("energetic", "workout", "dance", "upbeat", "party")),
            Map.entry("ROMANTIC", List.of("romantic", "love", "romance", "slow dance")),
            Map.entry("FOCUS", List.of("focus", "concentration", "instrumental", "study")),
            Map.entry("CHILL", List.of("chill", "laid back", "relaxing", "lounge")),
            Map.entry("MELANCHOLIC", List.of("melancholic", "melancholy", "emotional")),
            Map.entry("NOSTALGIC", List.of("nostalgic", "retro", "oldies", "throwback")),
            Map.entry("DREAMY", List.of("dreamy", "ethereal", "atmospheric", "ambient")));

    private final List<MusicDiscoveryProvider> providers;
    private final SpotifyTrackMatcher matcher;
    private final DiscoveryProperties properties;
    private final UserRepository users;
    private final HistoryRepository history;
    private final FavoriteRepository favorites;
    private final Map<String, CacheEntry> cache = new LinkedHashMap<>(32, .75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, CacheEntry> eldest) { return size() > 128; }
    };

    public DiscoveryService(List<MusicDiscoveryProvider> providers, SpotifyTrackMatcher matcher, DiscoveryProperties properties,
                            UserRepository users, HistoryRepository history, FavoriteRepository favorites) {
        this.providers = providers; this.matcher = matcher; this.properties = properties;
        this.users = users; this.history = history; this.favorites = favorites;
    }

    public List<String> tagsForMood(String mood) { return MOOD_TAGS.getOrDefault(mood == null ? "" : mood.toUpperCase(Locale.ROOT), List.of()); }

    public List<SongView> discoverMood(String mood, String email, int limit) {
        if (!properties.isMoodEnabled()) return List.of();
        List<String> tags = tagsForMood(mood);
        if (tags.isEmpty()) return List.of();
        Map<String, SongView> result = new LinkedHashMap<>();
        int perTag = Math.max(1, Math.min(5, limit));
        for (String tag : tags) {
            discover(new DiscoveryRequest("mood", tag, List.of(tag), null, null, perTag), email)
                    .forEach(track -> result.putIfAbsent(track.spotifyTrackId() != null ? track.spotifyTrackId() : String.valueOf(track.id()), track));
            if (result.size() >= limit) break;
        }
        return result.values().stream().limit(limit).toList();
    }

    public List<SongView> discoverForJourney(String email, int limit) {
        if (email == null || email.isBlank() || !properties.isEnabled()) return List.of();
        var user = users.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) return List.of();
        Map<String, Song> signals = new LinkedHashMap<>();
        for (ListeningHistory item : history.findTop20ByUserOrderByPlayedAtDesc(user)) {
            if (item.getSong() != null) signals.putIfAbsent(signalKey(item.getSong()), item.getSong());
        }
        for (Favorite item : favorites.findByUserOrderByCreatedAtDesc(user)) {
            if (item.getSong() != null) signals.putIfAbsent(signalKey(item.getSong()), item.getSong());
        }
        Map<String, SongView> result = new LinkedHashMap<>();
        signals.values().stream().map(Song::getArtist).filter(Objects::nonNull).filter(a -> !a.isBlank()).distinct().limit(5)
                .forEach(artist -> discover(new DiscoveryRequest("artist", artist, List.of(artist), null, null, Math.min(limit, 10)), email)
                        .forEach(track -> result.putIfAbsent(track.spotifyTrackId() != null ? track.spotifyTrackId() : String.valueOf(track.id()), track)));
        return result.values().stream().limit(limit).toList();
    }

    public List<SongView> discover(DiscoveryRequest request, String email) {
        if (!properties.isEnabled()) return List.of();
        String cacheKey = request.kind() + "|" + request.value() + "|" + request.country() + "|" + request.area();
        synchronized (cache) {
            CacheEntry cached = cache.get(cacheKey);
            if (cached != null && cached.expiresAt > System.currentTimeMillis()) return cached.songs;
        }
        Map<String, MusicCandidate> unique = new LinkedHashMap<>();
        for (MusicDiscoveryProvider provider : providers) {
            for (MusicCandidate candidate : provider.discover(request)) {
                String key = normalize(candidate.title()) + "|" + normalize(candidate.artist());
                if (!key.equals("|")) unique.putIfAbsent(key, candidate);
            }
        }
        List<SongView> matched = matcher.match(unique.values().stream().limit(request.limit() * 3L).toList(), email, request.limit());
        synchronized (cache) { cache.put(cacheKey, new CacheEntry(List.copyOf(matched), System.currentTimeMillis() + 300_000)); }
        log.info("[Discovery] kind={} candidates={} spotifyMatches={}", request.kind(), unique.size(), matched.size());
        return matched;
    }

    private String normalize(String value) { return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", ""); }
    private String signalKey(Song song) { return normalize(song.getArtist()) + "|" + normalize(song.getTitle()); }
    private record CacheEntry(List<SongView> songs, long expiresAt) { }
}
