package com.shreya.moodify.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shreya.moodify.dto.ApiDtos.SargamPlaceView;
import com.shreya.moodify.dto.ApiDtos.SongView;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class SargamService {
    private final WebClient client;
    private final ObjectMapper mapper;
    private final SpotifyService spotify;

    public SargamService(WebClient.Builder builder, ObjectMapper mapper, SpotifyService spotify) {
        this.client = builder.baseUrl("https://nominatim.openstreetmap.org").build();
        this.mapper = mapper;
        this.spotify = spotify;
    }

    public SargamPlaceView explore(String place, String email) {
        if (place == null || place.isBlank() || place.length() > 120) {
            throw new IllegalArgumentException("A place is required.");
        }
        try {
            String body = client.get().uri(uri -> uri.path("/search")
                            .queryParam("q", place.trim()).queryParam("format", "json")
                            .queryParam("limit", 1).build())
                    .header("User-Agent", "Moodiflo/1.0 (place discovery)")
                    .retrieve().bodyToMono(String.class).block();
            JsonNode result = mapper.readTree(body).path(0);
            if (result.isMissingNode()) throw new IllegalArgumentException("That place could not be resolved.");
            String displayName = result.path("display_name").asText(place.trim());
            String country = result.path("address").path("country").asText("");
            double latitude = result.path("lat").asDouble();
            double longitude = result.path("lon").asDouble();
            List<SongView> tracks = spotify.searchTracks(place.trim(), email, 0, 12);
            return new SargamPlaceView(displayName, latitude, longitude, country, tracks);
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (com.fasterxml.jackson.core.JsonProcessingException |
                 org.springframework.web.reactive.function.client.WebClientResponseException |
                 IllegalStateException ex) {
            throw new IllegalArgumentException("Place discovery is temporarily unavailable. Please retry.");
        }
    }
}
