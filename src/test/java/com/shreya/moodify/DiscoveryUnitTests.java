package com.shreya.moodify;

import com.shreya.moodify.discovery.NormalizedPlace;
import com.shreya.moodify.discovery.PlaceResolver;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DiscoveryUnitTests {
    @Test
    void resolvesPunjabWithCulturalDiscoveryCategories() {
        NormalizedPlace place = new PlaceResolver().resolve("Punjab");
        assertThat(place.country()).isEqualTo("India");
        assertThat(place.languages()).contains("Punjabi");
        assertThat(place.musicDiscoveryTags()).contains("Bhangra", "Punjabi Folk");
    }

    @Test
    void unknownPlacesRemainHonestAndDoNotFabricateMetadata() {
        NormalizedPlace place = new PlaceResolver().resolve("Somewhere Unknown");
        assertThat(place.supportedGeoLevel()).isEqualTo("unknown");
        assertThat(place.country()).isNull();
        assertThat(place.musicDiscoveryTags()).containsExactly("Somewhere Unknown music");
    }
}
