package com.shreya.moodify;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.User;
import com.shreya.moodify.entity.Lyrics;
import com.shreya.moodify.entity.Song;
import com.shreya.moodify.repository.UserRepository;
import com.shreya.moodify.repository.LyricsRepository;
import com.shreya.moodify.repository.SongRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import com.shreya.moodify.service.SpotifyService;
import com.shreya.moodify.integration.translation.TranslationService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MoodifyApiIntegrationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private LyricsRepository lyricsRepository;

    @MockBean
    private SpotifyService spotifyService;

    @MockBean
    private TranslationService translationService;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        Song fixture = songRepository.findById(1L).orElseGet(() -> {
            Song song = new Song();
            song.setTitle("Test Fixture Song");
            song.setArtist("Test Fixture Artist");
            song.setAlbum("Test Fixture Album");
            song.setDuration(180);
            song.setLanguage("English");
            song.setGenre("Pop");
            song.setDescription("Test-only catalog fixture");
            song.setPopularity(0.8);
            return songRepository.save(song);
        });
        if (lyricsRepository.findBySong(fixture).isEmpty()) {
            Lyrics lyrics = new Lyrics();
            lyrics.setSong(fixture);
            lyrics.setLanguage("English");
            lyrics.setLyricsText("Test fixture lyrics");
            lyricsRepository.save(lyrics);
        }
        SongView fixtureView = new SongView(fixture.getId(), fixture.getTitle(), fixture.getArtist(),
                fixture.getAlbum(), fixture.getDuration(), fixture.getAudioUrl(), fixture.getCoverImageUrl(),
                fixture.getLanguage(), fixture.getGenre(), fixture.getReleaseDate(), fixture.getDescription(),
                null, null, "TEST", fixture.getId().toString());
        when(spotifyService.searchByMood(anyString(), nullable(String.class), anyInt(), anyInt()))
                .thenReturn(List.of(fixtureView));
        when(translationService.translate(anyString(), anyString(), eq("Spanish")))
                .thenReturn("[Spanish] Test fixture lyrics");
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Test
    @DisplayName("Actuator health endpoint returns UP")
    void testActuatorHealth() {
        ResponseEntity<Map> response = restTemplate.getForEntity(baseUrl + "/actuator/health", Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("UP");
    }

    @Test
    @DisplayName("Auth flow: register, login, duplicate email check, and password hashing")
    void testAuthFlow() {
        String testEmail = "testuser_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest("Test User", testEmail, "StrongPassword123!", "English");

        // 1. Register
        ResponseEntity<AuthResponse> regRes = restTemplate.postForEntity(baseUrl + "/api/auth/register", registerReq, AuthResponse.class);
        assertThat(regRes.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(regRes.getBody()).isNotNull();
        assertThat(regRes.getBody().token()).isNotBlank();
        assertThat(regRes.getBody().user().email()).isEqualTo(testEmail);

        // 2. Verify password is encrypted in database
        User savedUser = userRepository.findByEmailIgnoreCase(testEmail).orElseThrow();
        assertThat(savedUser.getPassword()).isNotEqualTo("StrongPassword123!");
        assertThat(passwordEncoder.matches("StrongPassword123!", savedUser.getPassword())).isTrue();

        // 3. Duplicate email should fail
        ResponseEntity<Map> dupRes = restTemplate.postForEntity(baseUrl + "/api/auth/register", registerReq, Map.class);
        assertThat(dupRes.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // 4. Login with valid credentials
        LoginRequest loginReq = new LoginRequest(testEmail, "StrongPassword123!");
        ResponseEntity<AuthResponse> loginRes = restTemplate.postForEntity(baseUrl + "/api/auth/login", loginReq, AuthResponse.class);
        assertThat(loginRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginRes.getBody()).isNotNull();
        assertThat(loginRes.getBody().token()).isNotBlank();

        // 5. Login with invalid password
        LoginRequest badLogin = new LoginRequest(testEmail, "WrongPassword!");
        ResponseEntity<Map> badLoginRes = restTemplate.postForEntity(baseUrl + "/api/auth/login", badLogin, Map.class);
        assertThat(badLoginRes.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Protected endpoints reject unauthenticated and invalid requests with 401")
    void testProtectedEndpointsUnauthorized() {
        // No token
        ResponseEntity<Map> noTokenRes = restTemplate.getForEntity(baseUrl + "/api/users/me", Map.class);
        assertThat(noTokenRes.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(noTokenRes.getBody()).isNotNull();
        assertThat(noTokenRes.getBody().get("error")).isEqualTo("UNAUTHORIZED");

        // Invalid token
        HttpHeaders badHeaders = authHeaders("invalid-token-12345");
        HttpEntity<Void> badEntity = new HttpEntity<>(badHeaders);
        ResponseEntity<Map> badTokenRes = restTemplate.exchange(baseUrl + "/api/users/me", HttpMethod.GET, badEntity, Map.class);
        assertThat(badTokenRes.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Startup does not create demo accounts or grant catalog mutation access")
    void testRoleAuthorization() {
        // Startup must not create or mutate hardcoded legacy accounts.
        LoginRequest adminLogin = new LoginRequest("admin@moodify.local", "MoodifyAdmin123!");
        ResponseEntity<Map> adminLoginRes = restTemplate.postForEntity(baseUrl + "/api/auth/login", adminLogin, Map.class);
        assertThat(adminLoginRes.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // Production must not create a demo account.
        LoginRequest demoLogin = new LoginRequest("demo@moodify.local", "DemoUser123!");
        ResponseEntity<AuthResponse> demoAuthRes = restTemplate.postForEntity(baseUrl + "/api/auth/login", demoLogin, AuthResponse.class);
        assertThat(demoAuthRes.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // Catalog mutation remains unavailable without authentication.
        SongRequest songReq = new SongRequest(
                "Test Song", "Test Artist", "Test Album", 200,
                "https://example.com/audio.mp3", "https://example.com/cover.jpg",
                "English", "Pop", LocalDate.now(), "Description", 0.9
        );
        ResponseEntity<Map> unauthenticatedSongRes = restTemplate.postForEntity(baseUrl + "/api/songs", songReq, Map.class);
        assertThat(unauthenticatedSongRes.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Playlists CRUD and user isolation (ownership security)")
    void testPlaylistsAndOwnershipIsolation() {
        // Register User A
        String emailA = "user_a_" + System.currentTimeMillis() + "@example.com";
        AuthResponse authA = restTemplate.postForEntity(baseUrl + "/api/auth/register",
                new RegisterRequest("User A", emailA, "Password1234!", "English"), AuthResponse.class).getBody();

        // Register User B
        String emailB = "user_b_" + System.currentTimeMillis() + "@example.com";
        AuthResponse authB = restTemplate.postForEntity(baseUrl + "/api/auth/register",
                new RegisterRequest("User B", emailB, "Password1234!", "English"), AuthResponse.class).getBody();

        // User A creates playlist
        PlaylistRequest createReq = new PlaylistRequest("User A Playlist", "My vibes", "https://example.com/cover.jpg");
        HttpEntity<PlaylistRequest> createEntityA = new HttpEntity<>(createReq, authHeaders(authA.token()));
        ResponseEntity<PlaylistView> playlistResA = restTemplate.postForEntity(baseUrl + "/api/playlists", createEntityA, PlaylistView.class);
        assertThat(playlistResA.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        PlaylistView created = playlistResA.getBody();
        assertThat(created).isNotNull();
        Long playlistId = created.id();

        // User A adds song 1 to playlist
        HttpEntity<Void> addEntityA = new HttpEntity<>(authHeaders(authA.token()));
        ResponseEntity<PlaylistView> addResA = restTemplate.postForEntity(
                baseUrl + "/api/playlists/" + playlistId + "/songs/1", addEntityA, PlaylistView.class
        );
        assertThat(addResA.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(addResA.getBody().songs()).hasSize(1);

        // User B attempts to access / modify User A's playlist -> 403 FORBIDDEN
        HttpEntity<Void> entityB = new HttpEntity<>(authHeaders(authB.token()));
        ResponseEntity<Map> getByB = restTemplate.exchange(
                baseUrl + "/api/playlists/" + playlistId, HttpMethod.GET, entityB, Map.class
        );
        assertThat(getByB.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // User B attempts to delete User A's playlist -> 403 FORBIDDEN
        ResponseEntity<Map> deleteByB = restTemplate.exchange(
                baseUrl + "/api/playlists/" + playlistId, HttpMethod.DELETE, entityB, Map.class
        );
        assertThat(deleteByB.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // User A removes song
        ResponseEntity<Void> removeRes = restTemplate.exchange(
                baseUrl + "/api/playlists/" + playlistId + "/songs/1", HttpMethod.DELETE, addEntityA, Void.class
        );
        assertThat(removeRes.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // User A deletes playlist
        ResponseEntity<Void> deleteRes = restTemplate.exchange(
                baseUrl + "/api/playlists/" + playlistId, HttpMethod.DELETE, addEntityA, Void.class
        );
        assertThat(deleteRes.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }

    @Test
    @DisplayName("Favorites flow: add favorite, prevent duplicate, and remove favorite")
    void testFavoritesFlow() {
        String email = "fav_user_" + System.currentTimeMillis() + "@example.com";
        AuthResponse auth = restTemplate.postForEntity(baseUrl + "/api/auth/register",
                new RegisterRequest("Fav User", email, "Password1234!", "English"), AuthResponse.class).getBody();

        HttpEntity<Void> entity = new HttpEntity<>(authHeaders(auth.token()));

        // Favorite song 1
        ResponseEntity<Void> favRes = restTemplate.postForEntity(baseUrl + "/api/users/me/favorites/1", entity, Void.class);
        assertThat(favRes.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // List favorites
        ResponseEntity<List<SongView>> listRes = restTemplate.exchange(
                baseUrl + "/api/users/me/favorites", HttpMethod.GET, entity,
                new ParameterizedTypeReference<>() {}
        );
        assertThat(listRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listRes.getBody()).isNotEmpty();
        assertThat(listRes.getBody().get(0).id()).isEqualTo(1L);

        // Duplicate favorite should be idempotent
        ResponseEntity<Void> dupFavRes = restTemplate.postForEntity(baseUrl + "/api/users/me/favorites/1", entity, Void.class);
        assertThat(dupFavRes.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Unfavorite song 1 (verifies transactional delete)
        ResponseEntity<Void> unfavRes = restTemplate.exchange(
                baseUrl + "/api/users/me/favorites/1", HttpMethod.DELETE, entity, Void.class
        );
        assertThat(unfavRes.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // List favorites -> empty
        ResponseEntity<List<SongView>> listResAfter = restTemplate.exchange(
                baseUrl + "/api/users/me/favorites", HttpMethod.GET, entity,
                new ParameterizedTypeReference<>() {}
        );
        assertThat(listResAfter.getBody()).isEmpty();
    }

    @Test
    @DisplayName("Listening history and Home API discovery")
    void testListeningHistoryAndHome() {
        String email = "history_user_" + System.currentTimeMillis() + "@example.com";
        AuthResponse auth = restTemplate.postForEntity(baseUrl + "/api/auth/register",
                new RegisterRequest("History User", email, "Password1234!", "English"), AuthResponse.class).getBody();

        // 1. Record listening history (< 90% completion)
        HistoryRequest histReq = new HistoryRequest(1L, 60, "HAPPY");
        HttpEntity<HistoryRequest> histEntity = new HttpEntity<>(histReq, authHeaders(auth.token()));
        ResponseEntity<Void> histRes = restTemplate.postForEntity(baseUrl + "/api/listening-history", histEntity, Void.class);
        assertThat(histRes.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // 2. Query Home API
        HttpEntity<Void> homeEntity = new HttpEntity<>(authHeaders(auth.token()));
        ResponseEntity<DiscoveryResponse> homeRes = restTemplate.exchange(
                baseUrl + "/api/home", HttpMethod.GET, homeEntity, DiscoveryResponse.class
        );
        assertThat(homeRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        DiscoveryResponse discovery = homeRes.getBody();
        assertThat(discovery).isNotNull();
        assertThat(discovery.greeting()).contains("History User");
        assertThat(discovery.suggestedMood()).isEqualTo("HAPPY");
        assertThat(discovery.moodCards()).isNotEmpty();
        assertThat(discovery.continueListening()).isNotEmpty();
        assertThat(discovery.continueListening().get(0).id()).isEqualTo(1L);
        assertThat(discovery.trending()).isNotEmpty();
        assertThat(discovery.recommendedForYou()).isNotEmpty();
    }

    @Test
    @DisplayName("Mood discovery, recommendations, and mood sessions")
    void testMoodDiscovery() {
        // 1. Get moods
        ResponseEntity<List<MoodView>> moodsRes = restTemplate.exchange(
                baseUrl + "/api/moods", HttpMethod.GET, null, new ParameterizedTypeReference<>() {}
        );
        assertThat(moodsRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(moodsRes.getBody()).isNotEmpty();

        // 2. Mood recommendations
        ResponseEntity<Map> recRes = restTemplate.getForEntity(baseUrl + "/api/moods/HAPPY/recommendations", Map.class);
        assertThat(recRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(recRes.getBody().get("songs")).isNotNull();

        // 3. Mood session
        MoodSessionRequest sessionReq = new MoodSessionRequest("CALM", 0.7, "English");
        ResponseEntity<MoodSessionResponse> sessionRes = restTemplate.postForEntity(
                baseUrl + "/api/mood-session", sessionReq, MoodSessionResponse.class
        );
        assertThat(sessionRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(sessionRes.getBody()).isNotNull();
        assertThat(sessionRes.getBody().mood()).isEqualTo("CALM");
        assertThat(sessionRes.getBody().songs()).isNotEmpty();

        // 4. Discover query
        QueryRequest queryReq = new QueryRequest("I want to dance at a night party");
        ResponseEntity<QueryResponse> queryRes = restTemplate.postForEntity(
                baseUrl + "/api/discover/query", queryReq, QueryResponse.class
        );
        assertThat(queryRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(queryRes.getBody().interpretedMood()).isEqualTo("ENERGETIC");
    }

    @Test
    @DisplayName("Lyrics and translation caching")
    void testLyricsAndTranslation() {
        String email = "lyrics_user_" + System.currentTimeMillis() + "@example.com";
        AuthResponse auth = restTemplate.postForEntity(baseUrl + "/api/auth/register",
                new RegisterRequest("Lyrics User", email, "Password1234!", "English"), AuthResponse.class).getBody();

        // 1. Get lyrics for song 1
        ResponseEntity<List<String>> lyricsRes = restTemplate.exchange(
                baseUrl + "/api/songs/1/lyrics", HttpMethod.GET, null, new ParameterizedTypeReference<>() {}
        );
        assertThat(lyricsRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(lyricsRes.getBody()).isNotEmpty();

        // 2. Translate lyrics to Spanish (authenticated)
        TranslationRequest transReq = new TranslationRequest("Spanish");
        HttpEntity<TranslationRequest> transEntity = new HttpEntity<>(transReq, authHeaders(auth.token()));
        ResponseEntity<TranslationView> transRes = restTemplate.postForEntity(
                baseUrl + "/api/songs/1/translate", transEntity, TranslationView.class
        );
        assertThat(transRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(transRes.getBody()).isNotNull();
        assertThat(transRes.getBody().targetLanguage()).isEqualTo("Spanish");
        assertThat(transRes.getBody().translatedLyrics()).contains("[Spanish]");

        // 3. List cached translations
        ResponseEntity<List<TranslationView>> transListRes = restTemplate.exchange(
                baseUrl + "/api/songs/1/translations", HttpMethod.GET, null, new ParameterizedTypeReference<>() {}
        );
        assertThat(transListRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(transListRes.getBody()).isNotEmpty();
    }

    @Test
    @DisplayName("Search endpoints with query, partial match, empty, and nonexistent")
    void testSearchEndpoints() {
        // Search uses an isolated test fixture; production does not seed demo songs.
        ResponseEntity<PageResponse> searchRes = restTemplate.getForEntity(baseUrl + "/api/search?q=Fixture", PageResponse.class);
        assertThat(searchRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(searchRes.getBody().content()).isNotEmpty();

        // 2. /api/songs/search?query=Fixture
        ResponseEntity<PageResponse> songSearchRes = restTemplate.getForEntity(baseUrl + "/api/songs/search?query=Fixture", PageResponse.class);
        assertThat(songSearchRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(songSearchRes.getBody().content()).isNotEmpty();

        // 3. Search non-existent
        ResponseEntity<PageResponse> noResults = restTemplate.getForEntity(baseUrl + "/api/search?q=XYZNonExistentSong123", PageResponse.class);
        assertThat(noResults.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(noResults.getBody().content()).isEmpty();

        // 4. Empty search
        ResponseEntity<PageResponse> emptySearch = restTemplate.getForEntity(baseUrl + "/api/search?q=", PageResponse.class);
        assertThat(emptySearch.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
