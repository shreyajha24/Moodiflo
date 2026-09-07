package com.shreya.moodify.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shreya.moodify.dto.ApiDtos.SongView;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Uses Audius' official discovery and streaming APIs. Audius hosts the audio
 * and exposes only tracks that are currently streamable through its API.
 */
@Service
public class AudiusMusicProvider implements MusicProvider {
    private static final String API = "https://discoveryprovider.audius.co/v1/tracks/search";
    private static final String APP_NAME = "moodiflo";
    private static final Map<String, String> MOOD_QUERIES = Map.ofEntries(
            Map.entry("HAPPY", "happy upbeat feel good cheerful"),
            Map.entry("CALM", "calm chill relaxing ambient acoustic"),
            Map.entry("ENERGETIC", "energetic dance workout edm"),
            Map.entry("SAD", "sad emotional melancholic"),
            Map.entry("ROMANTIC", "romantic love rnb slow"),
            Map.entry("NOSTALGIC", "nostalgic retro classic"),
            Map.entry("FOCUS", "focus study instrumental lofi"),
            Map.entry("ANGRY", "angry intense rock metal"),
            Map.entry("DREAMY", "dreamy ethereal atmospheric"),
            Map.entry("MELANCHOLIC", "melancholic introspective"),
            Map.entry("PARTY", "party dance club"),
            Map.entry("HOPEFUL", "hopeful uplifting inspiring")
    );

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AudiusMusicProvider(WebClient.Builder builder, ObjectMapper objectMapper) {
        this.webClient = builder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    public MusicPage getTracksForMood(String mood, int page, int limit) {
        String query = MOOD_QUERIES.getOrDefault(mood.toUpperCase(Locale.ROOT), "music");
        try {
            List<SongView> songs = new ArrayList<>();
            List<String> queries = new ArrayList<>(List.of(query.split(" ")));
            queries.add(0, query);
            for (String candidate : queries) {
                String uri = API + "?query=" + encode(candidate)
                        + "&app_name=" + APP_NAME
                        + "&limit=" + limit
                        + "&offset=" + (page * limit);
                String body = webClient.get().uri(uri).retrieve().bodyToMono(String.class).block();
                songs = parse(objectMapper.readTree(body).path("data"), mood);
                if (!songs.isEmpty()) break;
            }
            return new MusicPage(songs, songs.size() == limit);
        } catch (Exception ignored) {
            return new MusicPage(List.of(), false);
        }
    }

    private List<SongView> parse(JsonNode data, String mood) {
        if (!data.isArray()) return List.of();
        List<SongView> songs = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (JsonNode track : data) {
            String trackId = track.path("id").asText("");
            JsonNode stream = track.path("stream");
            boolean streamable = track.path("is_streamable").asBoolean(false)
                    && !stream.path("url").asText("").isBlank();
            if (!streamable || !seen.add(trackId)) continue;

            String artist = track.path("user").path("name").asText(
                    track.path("user").path("handle").asText("Audius creator"));
            String artwork = track.path("artwork").path("480x480").asText(
                    track.path("artwork").path("150x150").asText(null));
            long id = -Math.abs(("audius:" + trackId).hashCode());
            songs.add(new SongView(
                    id,
                    track.path("title").asText("Untitled track"),
                    artist,
                    "Audius",
                    track.path("duration").asInt(0),
                    stream.path("url").asText(),
                    artwork,
                    null,
                    mood,
                    null,
                    track.path("description").asText(null),
                    null,
                    null,
                    "AUDIUS",
                    trackId
            ));
        }
        return songs;
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
