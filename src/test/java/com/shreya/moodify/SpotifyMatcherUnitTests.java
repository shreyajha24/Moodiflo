package com.shreya.moodify;

import com.shreya.moodify.discovery.MusicCandidate;
import com.shreya.moodify.discovery.SpotifyTrackMatcher;
import com.shreya.moodify.dto.ApiDtos.SongView;
import com.shreya.moodify.service.SpotifyService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SpotifyMatcherUnitTests {
    @Test
    void acceptsExactArtistAndTitleAndDeduplicates() {
        SpotifyService spotify = mock(SpotifyService.class);
        SongView result = new SongView(1L, "Levitating", "Dua Lipa", "Future Nostalgia", 203, null, "image", null, null, null, null,
                "spotify:track:abc", "abc", "https://open.spotify.com/track/abc", "SPOTIFY", "abc");
        when(spotify.searchTracks(anyString(), isNull(), eq(0), eq(5))).thenReturn(List.of(result));
        SpotifyTrackMatcher matcher = new SpotifyTrackMatcher(spotify);
        List<SongView> matched = matcher.match(List.of(
                new MusicCandidate("Levitating", "Dua Lipa", null, "lastfm", "1", null, List.of(), null, null, 1, "Last.fm"),
                new MusicCandidate("Levitating", "Dua Lipa", null, "musicbrainz", "2", null, List.of(), null, null, 1, "MusicBrainz")), null, 10);
        assertThat(matched).extracting(SongView::spotifyTrackId).containsExactly("abc");
    }

    @Test
    void rejectsAnArtistWithOnlyASimilarTitle() {
        SpotifyService spotify = mock(SpotifyService.class);
        SongView result = new SongView(1L, "Levitating", "The Weeknd", "Album", 203, null, null, null, null, null, null,
                "spotify:track:abc", "abc", "https://open.spotify.com/track/abc", "SPOTIFY", "abc");
        when(spotify.searchTracks(anyString(), isNull(), eq(0), eq(5))).thenReturn(List.of(result));
        List<SongView> matched = new SpotifyTrackMatcher(spotify).match(List.of(
                new MusicCandidate("Levitating", "Dua Lipa", null, "lastfm", "1", null, List.of(), null, null, 1, "Last.fm")), null, 10);
        assertThat(matched).isEmpty();
    }
}
