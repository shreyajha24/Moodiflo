package com.shreya.moodify.discovery;

import com.shreya.moodify.dto.ApiDtos.SongView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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
    private final Map<String, CacheEntry> cache = new LinkedHashMap<>(32, .75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, CacheEntry> eldest) { return size() > 128; }
    };

    public DiscoveryService(List<MusicDiscoveryProvider> providers, SpotifyTrackMatcher matcher, DiscoveryProperties properties) {
        this.providers = providers; this.matcher = matcher; this.properties = properties;
    }

    public List<String> tagsForMood(String mood) { return MOOD_TAGS.getOrDefault(mood == null ? "" : mood.toUpperCase(Locale.ROOT), List.of()); }

    public List<SongView> discoverMood(String mood, String email, int limit) {
        if (!properties.isMoodEnabled()) return List.of();
        List<String> tags = tagsForMood(mood);
        if (tags.isEmpty()) return List.of();
        return discover(new DiscoveryRequest("mood", String.join(" ", tags), tags, null, null, limit), email);
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
    private record CacheEntry(List<SongView> songs, long expiresAt) { }
}
