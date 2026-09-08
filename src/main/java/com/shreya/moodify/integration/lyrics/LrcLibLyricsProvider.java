package com.shreya.moodify.integration.lyrics;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.shreya.moodify.entity.Song;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Optional;

@Service
public class LrcLibLyricsProvider implements LyricsProvider {
    private final WebClient client;
    private final ObjectMapper mapper;

    public LrcLibLyricsProvider(WebClient.Builder builder, ObjectMapper mapper) {
        this.client = builder.baseUrl("https://lrclib.net").build();
        this.mapper = mapper;
    }

    @Override
    public Optional<ProvidedLyrics> find(Song song) {
        try {
            String body = client.get().uri(uri -> uri.path("/api/get")
                            .queryParam("track_name", song.getTitle())
                            .queryParam("artist_name", song.getArtist())
                            .build())
                    .header("User-Agent", "Moodiflo/1.0 (lyrics lookup)")
                    .retrieve().bodyToMono(String.class).block();
            JsonNode json = mapper.readTree(body);
            String lyrics = json.path("plainLyrics").asText("");
            if (lyrics.isBlank()) return Optional.empty();
            String language = song.getLanguage() == null || song.getLanguage().isBlank() ? "English" : song.getLanguage();
            return Optional.of(new ProvidedLyrics(language, lyrics));
        } catch (WebClientResponseException | JsonProcessingException | IllegalStateException ignored) {
            return Optional.empty();
        }
    }
}
