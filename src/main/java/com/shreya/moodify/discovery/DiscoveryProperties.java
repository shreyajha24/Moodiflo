package com.shreya.moodify.discovery;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.discovery")
public class DiscoveryProperties {
    private boolean enabled = true;
    private boolean moodEnabled = true;
    private boolean sargamEnabled = true;
    private String lastfmApiKey = "";
    private String lastfmBaseUrl = "https://ws.audioscrobbler.com/2.0/";
    private String musicbrainzBaseUrl = "https://musicbrainz.org/ws/2/";
    private String musicbrainzUserAgent = "Moodiflo/1.0 (contact@example.com)";
}
