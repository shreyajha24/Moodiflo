package com.shreya.moodify.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shreya.moodify.dto.ApiDtos.SargamPlaceView;
import com.shreya.moodify.dto.ApiDtos.SongView;
import com.shreya.moodify.dto.ApiDtos.SpotifySearchResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

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
                            .queryParam("addressdetails", 1).queryParam("limit", 1).build())
                    .header("User-Agent", "Moodiflo/1.0 (place discovery)")
                    .retrieve().bodyToMono(String.class).block();
            return discovery(mapper.readTree(body).path(0), email);
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Place discovery is temporarily unavailable. Please retry.");
        }
    }

    public SargamPlaceView reverse(double latitude, double longitude, String email) {
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("That location could not be resolved.");
        }
        try {
            String body = client.get().uri(uri -> uri.path("/reverse")
                            .queryParam("lat", latitude).queryParam("lon", longitude)
                            .queryParam("format", "json").queryParam("addressdetails", 1).build())
                    .header("User-Agent", "Moodiflo/1.0 (place discovery)")
                    .retrieve().bodyToMono(String.class).block();
            JsonNode result = mapper.readTree(body);
            if (result.path("error").asBoolean(false) || result.path("display_name").isMissingNode()) {
                throw new IllegalArgumentException("That location could not be resolved.");
            }
            return discovery(result, email);
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Location discovery is temporarily unavailable. Please retry.");
        }
    }

    private SargamPlaceView discovery(JsonNode result, String email) {
        if (result.isMissingNode() || result.path("display_name").asText("").isBlank()) {
            throw new IllegalArgumentException("Location not found.");
        }
        JsonNode address = result.path("address");
        String displayName = result.path("display_name").asText();
        String locality = firstNonBlank(address.path("city"), address.path("town"),
                address.path("village"), address.path("municipality"), address.path("state"));
        String country = address.path("country").asText("");
        List<String> queries = new ArrayList<>();
        addQuery(queries, locality);
        addQuery(queries, country);
        if (locality != null && !locality.isBlank() && country != null && !country.isBlank()) {
            addQuery(queries, locality + " music");
        }

        Map<String, SongView> trackMap = new LinkedHashMap<>();
        Map<String, String> artistMap = new LinkedHashMap<>();
        Map<String, String> artistIds = new LinkedHashMap<>();
        Map<String, String> genreMap = new LinkedHashMap<>();
        for (String query : queries) {
            try {
                SpotifySearchResponse grouped = spotify.searchAll(query, email, 0, 12);
                grouped.tracks().forEach(track -> trackMap.putIfAbsent(track.providerTrackId() != null ? track.providerTrackId() : String.valueOf(track.id()), track));
                grouped.artists().forEach(artist -> {
                    artistMap.putIfAbsent(artist.id(), artist.name());
                    artistIds.putIfAbsent(artist.id(), artist.id());
                    if (artist.subtitle() != null && !artist.subtitle().isBlank() && !artist.subtitle().equalsIgnoreCase("Artist")) {
                        genreMap.putIfAbsent(artist.subtitle(), artist.subtitle());
                    }
                });
            } catch (RuntimeException ex) {
                // One failed query must not prevent the other resolved place terms
                // from returning real Spotify results.
            }
        }
        List<SongView> tracks = trackMap.values().stream().limit(20).toList();
        artistIds.keySet().stream().limit(8).forEach(artistId ->
                spotify.artistGenres(artistId, email).forEach(genre -> genreMap.putIfAbsent(genre, genre)));
        List<String> genres = genreMap.values().stream().limit(8).toList();
        List<String> artists = artistMap.values().stream().limit(8).toList();
        return new SargamPlaceView(displayName, result.path("lat").asDouble(),
                result.path("lon").asDouble(), country, tracks, genres, artists);
    }

    private void addQuery(List<String> queries, String value) {
        if (value != null && !value.isBlank() && queries.stream().noneMatch(value::equalsIgnoreCase)) {
            queries.add(value.trim());
        }
    }

    private String firstNonBlank(JsonNode... values) {
        for (JsonNode value : values) {
            String text = value.asText("");
            if (!text.isBlank()) return text;
        }
        return "";
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return "";
    }
}
