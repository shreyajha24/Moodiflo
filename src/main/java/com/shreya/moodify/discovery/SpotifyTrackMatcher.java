package com.shreya.moodify.discovery;

import com.shreya.moodify.dto.ApiDtos.SongView;
import com.shreya.moodify.service.SpotifyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;

@Service
public class SpotifyTrackMatcher {
    private static final Logger log = LoggerFactory.getLogger(SpotifyTrackMatcher.class);
    private final SpotifyService spotify;

    public SpotifyTrackMatcher(SpotifyService spotify) { this.spotify = spotify; }

    public List<SongView> match(List<MusicCandidate> candidates, String email, int limit) {
        Map<String, SongView> matched = new LinkedHashMap<>();
        for (MusicCandidate candidate : candidates) {
            if (candidate.title() == null || candidate.title().isBlank() || candidate.artist() == null || candidate.artist().isBlank()) continue;
            try {
                List<SongView> results = spotify.searchTracks(candidate.artist() + " " + candidate.title(), email, 0, 5);
                results.stream().map(song -> new Scored(song, score(candidate, song))).filter(s -> s.score >= 0.80)
                        .max(Comparator.comparingDouble(Scored::score)).ifPresent(s -> matched.putIfAbsent(
                                s.song.spotifyTrackId() != null ? s.song.spotifyTrackId() : String.valueOf(s.song.id()), s.song));
            } catch (RuntimeException ignored) { }
            if (matched.size() >= limit) break;
        }
        log.info("[SpotifyMatcher] candidates={} matched={}", candidates.size(), matched.size());
        return matched.values().stream().limit(limit).toList();
    }

    private double score(MusicCandidate candidate, SongView song) {
        String expectedTitle = normalize(candidate.title());
        String actualTitle = normalize(song.title());
        String expectedArtist = normalizeArtist(candidate.artist());
        String actualArtist = normalizeArtist(song.artist());
        if (expectedTitle.equals(actualTitle) && expectedArtist.equals(actualArtist)) return 1.0;
        if (expectedTitle.equals(actualTitle) && (actualArtist.contains(expectedArtist) || expectedArtist.contains(actualArtist))) return .92;
        return .5 * similarity(expectedTitle, actualTitle) + .5 * similarity(expectedArtist, actualArtist);
    }

    private String normalizeArtist(String value) { return normalize(value).replaceAll("\\b(feat|ft|featuring)\\b.*$", "").trim(); }
    private String normalize(String value) {
        if (value == null) return "";
        String ascii = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return ascii.toLowerCase(Locale.ROOT).replaceAll("\\([^)]*(remix|version|edit)[^)]*\\)", "")
                .replaceAll("\\[(remix|version|edit)[^]]*\\]", "").replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
    }
    private double similarity(String left, String right) {
        if (left.equals(right)) return 1;
        if (left.isBlank() || right.isBlank()) return 0;
        return left.contains(right) || right.contains(left) ? .86 : 0;
    }
    private record Scored(SongView song, double score) { }
}
