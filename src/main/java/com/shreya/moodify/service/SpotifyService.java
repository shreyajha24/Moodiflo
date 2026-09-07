package com.shreya.moodify.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shreya.moodify.config.SpotifyConfig;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.User;
import com.shreya.moodify.exception.ApiExceptions;
import com.shreya.moodify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class SpotifyService {

    private static final Logger log = LoggerFactory.getLogger(SpotifyService.class);

    private static final String SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";
    private static final String SPOTIFY_API = "https://api.spotify.com/v1";
    private static final String SCOPES =
            "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";

    // Mood → Spotify search query mapping
    private static final Map<String, String> MOOD_QUERIES = Map.ofEntries(
        Map.entry("HAPPY",       "happy upbeat feel-good pop"),
        Map.entry("CALM",        "calm peaceful ambient acoustic"),
        Map.entry("ENERGETIC",   "energetic high-energy workout edm"),
        Map.entry("SAD",         "sad emotional heartbreak indie"),
        Map.entry("ROMANTIC",    "romantic love soul r&b"),
        Map.entry("NOSTALGIC",   "nostalgic retro classic 80s"),
        Map.entry("FOCUS",       "focus study instrumental lo-fi"),
        Map.entry("ANGRY",       "intense aggressive metal rock"),
        Map.entry("DREAMY",      "dreamy ethereal dream-pop shoegaze"),
        Map.entry("MELANCHOLIC", "melancholic introspective indie singer-songwriter"),
        Map.entry("PARTY",       "party dance club pop"),
        Map.entry("HOPEFUL",     "hopeful uplifting inspiring folk")
    );

    private final SpotifyConfig config;
    private final UserRepository userRepo;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // Client-credentials token cache (not user-specific — for anonymous search fallback)
    private volatile String clientCredentialsToken;
    private volatile Instant clientCredentialsExpiry = Instant.EPOCH;
    private final Map<String, PendingAuthorization> pendingAuthorizations = new ConcurrentHashMap<>();

    public SpotifyService(SpotifyConfig config, UserRepository userRepo,
                          WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.config = config;
        this.userRepo = userRepo;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String getFrontendUrl() {
        return config.getFrontendUrl();
    }

    private record PendingAuthorization(String email, Instant createdAt) {}

    // ─────────────────────────────────────────────────────────────
    // Auth URL
    // ─────────────────────────────────────────────────────────────

    public String buildAuthUrl(String userEmail) {
        if (!config.isConfigured()) {
            throw new ApiExceptions.BadRequest("Spotify credentials are not configured on this server.");
        }
        String state = UUID.randomUUID().toString();
        pendingAuthorizations.put(state, new PendingAuthorization(userEmail, Instant.now()));
        return SPOTIFY_ACCOUNTS + "/authorize"
                + "?response_type=code"
                + "&client_id=" + encode(config.getClientId())
                + "&scope=" + encode(SCOPES)
                + "&redirect_uri=" + encode(config.getRedirectUri())
                + "&state=" + encode(state);
    }

    // ─────────────────────────────────────────────────────────────
    // OAuth callback — exchange code for tokens
    // ─────────────────────────────────────────────────────────────

    public void exchangeCode(String code, String state) {
        PendingAuthorization pending = pendingAuthorizations.remove(state);
        if (pending == null || pending.createdAt().isBefore(Instant.now().minusSeconds(600))) {
            throw new ApiExceptions.BadRequest("Invalid OAuth state parameter.");
        }
        String userEmail = pending.email();

        User user = userRepo.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ApiExceptions.NotFound("User not found during Spotify callback."));

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", config.getRedirectUri());

        JsonNode tokenNode = postToSpotifyAccounts("/api/token", form);
        applyTokensToUser(user, tokenNode);
        userRepo.save(user);
    }

    // ─────────────────────────────────────────────────────────────
    // Get valid access token (refreshes if expired)
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public String getAccessToken(String userEmail) {
        User user = userRepo.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ApiExceptions.NotFound("User not found."));

        if (user.getSpotifyAccessToken() == null) {
            throw new ApiExceptions.BadRequest("Spotify account not connected.");
        }

        // Refresh if token expires within 60 seconds
        if (user.getSpotifyTokenExpiresAt() == null
                || Instant.now().isAfter(user.getSpotifyTokenExpiresAt().minusSeconds(60))) {
            return refreshToken(user);
        }

        return user.getSpotifyAccessToken();
    }

    // ─────────────────────────────────────────────────────────────
    // Status
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SpotifyStatusView getStatus(String userEmail) {
        boolean configured = config.isConfigured();
        if (!configured) {
            return new SpotifyStatusView(false, false, null, null);
        }
        User user = userRepo.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ApiExceptions.NotFound("User not found."));
        boolean connected = user.getSpotifyAccessToken() != null;
        return new SpotifyStatusView(connected, true,
                user.getSpotifyDisplayName(), user.getSpotifyProduct());
    }

    // ─────────────────────────────────────────────────────────────
    // Disconnect
    // ─────────────────────────────────────────────────────────────

    public void disconnect(String userEmail) {
        User user = userRepo.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ApiExceptions.NotFound("User not found."));
        user.setSpotifyAccessToken(null);
        user.setSpotifyRefreshToken(null);
        user.setSpotifyTokenExpiresAt(null);
        user.setSpotifyUserId(null);
        user.setSpotifyDisplayName(null);
        user.setSpotifyProduct(null);
        userRepo.save(user);
    }

    // ─────────────────────────────────────────────────────────────
    // Search tracks by mood
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SongView> searchByMood(String mood, String userEmail, int offset, int limit) {
        if (!config.isConfigured()) {
            return List.of(); // caller falls back to DB recommendations
        }

        String query = MOOD_QUERIES.getOrDefault(mood.toUpperCase(), "music");
        String token;

        // Try user token first (better personalization), fall back to client credentials
        try {
            if (userEmail != null) {
                token = getAccessToken(userEmail);
            } else {
                token = getClientCredentialsToken();
            }
        } catch (Exception e) {
            try {
                token = getClientCredentialsToken();
            } catch (Exception ex) {
                log.warn("Cannot get any Spotify token for mood search: {}", ex.getMessage());
                return List.of();
            }
        }

        try {
            String url = SPOTIFY_API + "/search?type=track&limit=" + limit
                    + "&offset=" + offset + "&q=" + encode(query);
            String body = webClient.get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseTrackResults(objectMapper.readTree(body), mood);
        } catch (WebClientResponseException.Unauthorized e) {
            // Token expired mid-request — clear cached client credentials token and retry once
            clientCredentialsToken = null;
            clientCredentialsExpiry = Instant.EPOCH;
            log.warn("Spotify 401 during mood search — token cleared");
            return List.of();
        } catch (Exception e) {
            log.warn("Spotify search failed for mood {}: {}", mood, e.getMessage());
            return List.of();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────

    private String refreshToken(User user) {
        if (user.getSpotifyRefreshToken() == null) {
            throw new ApiExceptions.BadRequest("No Spotify refresh token available. Please reconnect Spotify.");
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", user.getSpotifyRefreshToken());

        JsonNode tokenNode = postToSpotifyAccounts("/api/token", form);
        applyTokensToUser(user, tokenNode);
        // Keep existing refresh token if Spotify doesn't return a new one
        if (!tokenNode.has("refresh_token") || tokenNode.get("refresh_token").isNull()) {
            // don't overwrite the existing refresh token
        }
        userRepo.save(user);
        return user.getSpotifyAccessToken();
    }

    private void applyTokensToUser(User user, JsonNode tokenNode) {
        user.setSpotifyAccessToken(tokenNode.get("access_token").asText());
        int expiresIn = tokenNode.has("expires_in") ? tokenNode.get("expires_in").asInt(3600) : 3600;
        user.setSpotifyTokenExpiresAt(Instant.now().plusSeconds(expiresIn));
        if (tokenNode.has("refresh_token") && !tokenNode.get("refresh_token").isNull()
                && !tokenNode.get("refresh_token").asText().isBlank()) {
            user.setSpotifyRefreshToken(tokenNode.get("refresh_token").asText());
        }

        // Fetch Spotify user profile
        try {
            String profileBody = webClient.get()
                    .uri(SPOTIFY_API + "/me")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + user.getSpotifyAccessToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            JsonNode profile = objectMapper.readTree(profileBody);
            user.setSpotifyUserId(profile.path("id").asText(null));
            user.setSpotifyDisplayName(profile.path("display_name").asText(null));
            user.setSpotifyProduct(profile.path("product").asText(null));
        } catch (Exception e) {
            log.warn("Could not fetch Spotify profile after token exchange: {}", e.getMessage());
        }
    }

    private synchronized String getClientCredentialsToken() {
        if (clientCredentialsToken != null && Instant.now().isBefore(clientCredentialsExpiry.minusSeconds(60))) {
            return clientCredentialsToken;
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");

        JsonNode tokenNode = postToSpotifyAccounts("/api/token", form);
        clientCredentialsToken = tokenNode.get("access_token").asText();
        int expiresIn = tokenNode.has("expires_in") ? tokenNode.get("expires_in").asInt(3600) : 3600;
        clientCredentialsExpiry = Instant.now().plusSeconds(expiresIn);
        return clientCredentialsToken;
    }

    private JsonNode postToSpotifyAccounts(String path, MultiValueMap<String, String> form) {
        String credentials = config.getClientId() + ":" + config.getClientSecret();
        String basicAuth = "Basic " + Base64.getEncoder().encodeToString(
                credentials.getBytes(StandardCharsets.UTF_8));
        try {
            String body = webClient.post()
                    .uri(SPOTIFY_ACCOUNTS + path)
                    .header(HttpHeaders.AUTHORIZATION, basicAuth)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(form))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return objectMapper.readTree(body);
        } catch (WebClientResponseException e) {
            log.error("Spotify token request failed [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ApiExceptions.BadRequest("Spotify authentication failed: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Spotify token request error: {}", e.getMessage());
            throw new ApiExceptions.BadRequest("Failed to communicate with Spotify.");
        }
    }

    private List<SongView> parseTrackResults(JsonNode root, String mood) {
        List<SongView> results = new ArrayList<>();
        JsonNode items = root.path("tracks").path("items");
        if (items.isMissingNode() || !items.isArray()) return results;

        for (JsonNode track : items) {
            try {
                String id = track.path("id").asText(null);
                String name = track.path("name").asText("Unknown");
                String artist = track.path("artists").isArray() && track.path("artists").size() > 0
                        ? track.path("artists").get(0).path("name").asText("Unknown")
                        : "Unknown";
                JsonNode album = track.path("album");
                String albumName = album.path("name").asText(null);
                String coverUrl = null;
                JsonNode images = album.path("images");
                if (images.isArray() && images.size() > 0) {
                    coverUrl = images.get(0).path("url").asText(null);
                }
                String spotifyUri = track.path("uri").asText(null);
                String previewUrl = track.path("preview_url").isNull() ? null
                        : track.path("preview_url").asText(null);
                int durationMs = track.path("duration_ms").asInt(0);
                int durationSec = durationMs / 1000;

                // Use a synthetic negative ID to distinguish from DB songs
                long syntheticId = -Math.abs(id != null ? id.hashCode() : results.size());

                results.add(new SongView(
                        syntheticId,
                        name,
                        artist,
                        albumName,
                        durationSec > 0 ? durationSec : null,
                        previewUrl,    // audioUrl = previewUrl (30-sec, no Premium needed)
                        coverUrl,
                        null,          // language
                        mood,          // genre = mood label
                        null,          // releaseDate
                        null,          // description
                        spotifyUri,    // spotifyUri for SDK playback
                        id,            // spotifyTrackId
                        "SPOTIFY",
                        id             // providerTrackId
                ));
            } catch (Exception e) {
                log.debug("Skipping malformed Spotify track: {}", e.getMessage());
            }
        }
        return results;
    }

    private static String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
