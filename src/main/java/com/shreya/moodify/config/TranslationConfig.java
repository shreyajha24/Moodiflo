package com.shreya.moodify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;

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
    @Value("${app.translation.google-location:global}")
    private String googleLocation;

    public String getUrl() {
        return url;
    }
    public boolean isGoogleEnabled() { return googleEnabled; }
    public String getGoogleProject() { return googleProject; }
    public String getGoogleCredentials() { return googleCredentials; }
    public String getGoogleLocation() { return googleLocation; }

    /** Returns a safe configuration diagnostic without exposing credential contents. */
    public String googleConfigurationError() {
        if (!googleEnabled) return null;
        if (googleProject == null || googleProject.isBlank()) return "GOOGLE_TRANSLATE_PROJECT_ID is missing.";
        if (googleCredentials == null || googleCredentials.isBlank()) return "GOOGLE_TRANSLATE_CREDENTIALS is missing.";
        try {
            Path path = Path.of(googleCredentials);
            if (!Files.exists(path)) return "Google credentials file does not exist at the configured path.";
            if (!Files.isRegularFile(path)) return "Google credentials path is not a regular file.";
            if (!Files.isReadable(path)) return "Google credentials file cannot be read.";
        } catch (RuntimeException ex) {
            return "Google credentials path is invalid.";
        }
        return null;
    }

    public boolean isGoogleConfigured() { return googleConfigurationError() == null && googleEnabled; }
}
