package com.shreya.moodify.discovery;

import java.util.List;

/** Provider-neutral discovery result. It is never treated as playable audio. */
public record MusicCandidate(
        String title,
        String artist,
        String album,
        String externalProvider,
        String externalId,
        String isrc,
        List<String> tags,
        String country,
        String area,
        double score,
        String source) {
    public MusicCandidate {
        tags = tags == null ? List.of() : List.copyOf(tags);
    }
}
