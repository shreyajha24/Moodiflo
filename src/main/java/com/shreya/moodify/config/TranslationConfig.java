package com.shreya.moodify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TranslationConfig {
    @Value("${app.translation.url:https://api.mymemory.translated.net/get}")
    private String url;

    @Value("${app.translation.google-enabled:false}")
    private boolean googleEnabled;
    @Value("${app.translation.google-project:}")
    private String googleProject;
    @Value("${app.translation.google-credentials:}")
    private String googleCredentials;

    public String getUrl() {
        return url;
    }
    public boolean isGoogleEnabled() { return googleEnabled; }
    public String getGoogleProject() { return googleProject; }
    public String getGoogleCredentials() { return googleCredentials; }
}
