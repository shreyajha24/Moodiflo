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
public class MusicBrainzDiscoveryProvider implements MusicDiscoveryProvider {
    private static final Logger log = LoggerFactory.getLogger(MusicBrainzDiscoveryProvider.class);
    private final WebClient client;
    private final ObjectMapper mapper;
    private final DiscoveryProperties properties;

    public MusicBrainzDiscoveryProvider(WebClient.Builder builder, ObjectMapper mapper, DiscoveryProperties properties) {
        this.client = builder.baseUrl(properties.getMusicbrainzBaseUrl()).build();
        this.mapper = mapper;
        this.properties = properties;
    }

    @Override public String name() { return "musicbrainz"; }

    @Override
    public List<MusicCandidate> discover(DiscoveryRequest request) {
        if (!properties.isEnabled()) return List.of();
        try {
            String query = request.value() == null ? String.join(" ", request.tags()) : request.value();
            String body = client.get().uri(uri -> uri.path("artist/").queryParam("query", query)
                    .queryParam("fmt", "json").queryParam("limit", request.limit()).build())
                    .header("User-Agent", properties.getMusicbrainzUserAgent())
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(8));
            JsonNode artists = mapper.readTree(body == null ? "{}" : body).path("artists");
            List<MusicCandidate> result = new ArrayList<>();
            for (JsonNode artist : artists) {
                String name = artist.path("name").asText("");
                if (name.isBlank()) continue;
                List<String> tags = new ArrayList<>();
                artist.path("tags").forEach(tag -> tags.add(tag.path("name").asText("")));
                result.add(new MusicCandidate(null, name, null, "musicbrainz", artist.path("id").asText(null), null,
                        tags, artist.path("country").asText(request.country()), artist.path("area").path("name").asText(request.area()),
                        artist.path("score").asDouble(0), "MusicBrainz"));
            }
            log.info("[Discovery] kind={} provider=musicbrainz status=success results={}", request.kind(), result.size());
            return result;
        } catch (Exception ex) {
            log.warn("[Discovery] kind={} provider=musicbrainz status=unavailable reason={}", request.kind(), ex.getClass().getSimpleName());
            return List.of();
        }
    }
}
