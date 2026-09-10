package com.shreya.moodify.discovery;

import java.util.List;

public record NormalizedPlace(String displayName, String country, String region, String city,
                              List<String> aliases, List<String> languages, List<String> culturalTags,
                              List<String> musicDiscoveryTags, String supportedGeoLevel) {
    public NormalizedPlace {
        aliases = aliases == null ? List.of() : List.copyOf(aliases);
        languages = languages == null ? List.of() : List.copyOf(languages);
        culturalTags = culturalTags == null ? List.of() : List.copyOf(culturalTags);
        musicDiscoveryTags = musicDiscoveryTags == null ? List.of() : List.copyOf(musicDiscoveryTags);
    }
}
