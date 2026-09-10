package com.shreya.moodify.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shreya.moodify.dto.ApiDtos.SargamPlaceView;
import com.shreya.moodify.dto.ApiDtos.SongView;
import com.shreya.moodify.dto.ApiDtos.SpotifySearchResponse;
import com.shreya.moodify.discovery.DiscoveryRequest;
import com.shreya.moodify.discovery.DiscoveryService;
import com.shreya.moodify.discovery.NormalizedPlace;
import com.shreya.moodify.discovery.PlaceResolver;
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
    private final DiscoveryService discovery;
    private final PlaceResolver placeResolver;

    public SargamService(WebClient.Builder builder, ObjectMapper mapper, SpotifyService spotify,
                         DiscoveryService discovery, PlaceResolver placeResolver) {
        this.client = builder.baseUrl("https://nominatim.openstreetmap.org").build();
        this.mapper = mapper;
        this.spotify = spotify;
        this.discovery = discovery;
        this.placeResolver = placeResolver;
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
        String region = firstNonBlank(address.path("state"), address.path("region"), address.path("state_district"));
        String countryCode = address.path("country_code").asText("").toUpperCase();
        String placeName = firstNonBlank(locality, region, country);
        NormalizedPlace normalizedPlace = placeResolver.resolve(placeName);
        List<String> queries = new ArrayList<>();
        addQuery(queries, placeName + " music");
        addQuery(queries, placeName + " songs");
        addQuery(queries, placeName + " artists");
        addQuery(queries, placeName + " folk");
        addQuery(queries, placeName + " pop");
        if (region != null && !region.isBlank() && !region.equalsIgnoreCase(placeName)) {
            addQuery(queries, region + " music");
            addQuery(queries, region + " folk");
        }
        addQuery(queries, country + " indie");
        addQuery(queries, country + " music");

        Map<String, SongView> trackMap = new LinkedHashMap<>();
        Map<String, String> artistMap = new LinkedHashMap<>();
        Map<String, String> artistIds = new LinkedHashMap<>();
        Map<String, String> genreMap = new LinkedHashMap<>();
        try {
            List<SongView> externalTracks = discovery.discover(new DiscoveryRequest("place", placeName,
                    normalizedPlace.musicDiscoveryTags(), country, region, 20), email);
            externalTracks.forEach(track -> trackMap.putIfAbsent(track.spotifyTrackId() != null ? track.spotifyTrackId() : String.valueOf(track.id()), track));
            normalizedPlace.musicDiscoveryTags().forEach(tag -> genreMap.putIfAbsent(tag, tag));
        } catch (RuntimeException ignored) {
            // Sargam retains the existing Spotify query path if external discovery is unavailable.
        }
        for (String query : queries) {
            try {
                SpotifySearchResponse grouped = spotify.searchAll(query, email, 0, 12);
                grouped.tracks().forEach(track -> {
                    trackMap.putIfAbsent(track.providerTrackId() != null ? track.providerTrackId() : String.valueOf(track.id()), track);
                    if (track.artist() != null && !track.artist().isBlank()) {
                        artistMap.putIfAbsent(track.artist(), track.artist());
                    }
                });
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
                // The Spotify service logs the safe request failure details.
            }
        }
        List<SongView> tracks = trackMap.values().stream().limit(20).toList();
        artistIds.keySet().stream().limit(8).forEach(artistId ->
                spotify.artistGenres(artistId, email).forEach(genre -> genreMap.putIfAbsent(genre, genre)));
        // Spotify artist genres may be absent. These are explicitly derived
        // discovery categories, never presented as Spotify genre metadata.
        addCategory(genreMap, placeName);
        addCategory(genreMap, region);
        if (placeName != null && !placeName.isBlank()) addCategory(genreMap, placeName + " music");
        if (region != null && !region.isBlank()) addCategory(genreMap, region + " folk");
        if (country != null && !country.isBlank()) addCategory(genreMap, country + " indie");
        List<String> genres = genreMap.values().stream().limit(8).toList();
        List<String> artists = artistMap.values().stream().limit(8).toList();
        org.slf4j.LoggerFactory.getLogger(SargamService.class).info(
                "Sargam place={} country={} queries={} spotifyTracks={} artists={} categories={}",
                placeName, country, queries.size(), tracks.size(), artists.size(), genres.size());
        return new SargamPlaceView(placeName, displayName, result.path("lat").asDouble(),
                result.path("lon").asDouble(), country, countryCode, region, tracks, genres, artists, queries);
    }

    private void addQuery(List<String> queries, String value) {
        if (value != null && !value.isBlank() && queries.stream().noneMatch(value::equalsIgnoreCase)) {
            queries.add(value.trim());
        }
    }

    private void addCategory(Map<String, String> categories, String value) {
        if (value != null && !value.isBlank()) categories.putIfAbsent(value.trim(), value.trim());
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
