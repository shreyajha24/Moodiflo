package com.shreya.moodify.discovery;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
public class LastFmDiscoveryProvider implements MusicDiscoveryProvider {
    private static final Logger log = LoggerFactory.getLogger(LastFmDiscoveryProvider.class);
    private final WebClient client;
    private final ObjectMapper mapper;
    private final DiscoveryProperties properties;

    public LastFmDiscoveryProvider(WebClient.Builder builder, ObjectMapper mapper, DiscoveryProperties properties) {
        this.client = builder.baseUrl(properties.getLastfmBaseUrl()).build();
        this.mapper = mapper;
        this.properties = properties;
    }

    @Override public String name() { return "lastfm"; }

    @Override
    public List<MusicCandidate> discover(DiscoveryRequest request) {
        if (!properties.isEnabled() || properties.getLastfmApiKey() == null || properties.getLastfmApiKey().isBlank()) return List.of();
        try {
            String query = request.value() == null ? String.join(" ", request.tags()) : request.value();
            String body = client.get().uri(uri -> uri.queryParam("method", method(request))
                    .queryParam("api_key", properties.getLastfmApiKey()).queryParam("format", "json")
                    .queryParam("limit", request.limit()).queryParam("tag", query).build())
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(8));
            JsonNode root = mapper.readTree(body == null ? "{}" : body);
            JsonNode items = root.path("tracks").path("track");
            if (!items.isArray()) items = root.path("artists").path("artist");
            List<MusicCandidate> result = new ArrayList<>();
            for (JsonNode item : items) {
                String title = item.path("name").asText("");
                String artist = item.path("artist").path("name").asText(item.path("name").asText(""));
                if (title.isBlank()) continue;
                List<String> tags = new ArrayList<>();
                item.path("toptags").path("tag").forEach(tag -> tags.add(tag.path("name").asText("")));
                result.add(new MusicCandidate(title, artist, item.path("album").path("title").asText(null),
                        "lastfm", item.path("url").asText(null), null, tags, request.country(), request.area(),
                        item.path("listeners").asDouble(0), "Last.fm"));
            }
            log.info("[Discovery] kind={} provider=lastfm status=success results={}", request.kind(), result.size());
            return result;
        } catch (Exception ex) {
            log.warn("[Discovery] kind={} provider=lastfm status=unavailable reason={}", request.kind(), ex.getClass().getSimpleName());
            return List.of();
        }
    }

    private String method(DiscoveryRequest request) {
        return "artist".equalsIgnoreCase(request.kind()) ? "artist.gettoptracks" : "tag.gettoptracks";
    }
}
