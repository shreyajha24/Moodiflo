package com.shreya.moodify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpotifyConfig {

    @Value("${app.spotify.client-id:}")
    private String clientId;

    @Value("${app.spotify.client-secret:}")
    private String clientSecret;

    @Value("${app.spotify.redirect-uri:http://localhost:8080/api/spotify/callback}")
    private String redirectUri;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public String getClientId() { return clientId; }
    public String getClientSecret() { return clientSecret; }
    public String getRedirectUri() { return redirectUri; }
    public String getFrontendUrl() { return frontendUrl; }

    /** Returns true if Spotify credentials are actually configured. */
    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }
}
