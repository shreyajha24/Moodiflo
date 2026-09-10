package com.shreya.moodify.discovery;

import java.util.List;

public record DiscoveryRequest(String kind, String value, List<String> tags, String country, String area, int limit) {
    public DiscoveryRequest {
        tags = tags == null ? List.of() : List.copyOf(tags);
        limit = Math.max(1, Math.min(limit, 50));
    }
}
