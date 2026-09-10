package com.shreya.moodify.integration.translation;

import com.shreya.moodify.config.TranslationConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

/** Selects exactly one configured translation provider. */
@Service
@Primary
public class TranslationServiceRouter implements TranslationService {
    private static final Logger log = LoggerFactory.getLogger(TranslationServiceRouter.class);
    private final TranslationConfig config;
    private final MyMemoryTranslationService myMemory;
    private final ObjectProvider<GoogleCloudTranslationProvider> google;

    public TranslationServiceRouter(TranslationConfig config, MyMemoryTranslationService myMemory,
                                    ObjectProvider<GoogleCloudTranslationProvider> google) {
        this.config = config;
        this.myMemory = myMemory;
        this.google = google;
    }

    @PostConstruct
    void logProviderSelection() {
        if (!config.isGoogleEnabled()) {
            log.info("[Translation] Google Translation provider disabled; MyMemory provider selected.");
            return;
        }
        GoogleCloudTranslationProvider provider = google.getIfAvailable();
        if (provider == null) {
            log.error("[Translation] Google Translation provider unavailable: Google provider bean was not initialized.");
        } else if (!provider.isConfigured()) {
            log.error("[Translation] Google Translation provider unavailable: {}", provider.configurationError());
        } else {
            log.info("[Translation] Google Translation provider enabled for project {}.", config.getGoogleProject());
        }
    }

    @Override
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (config.isGoogleEnabled()) {
            GoogleCloudTranslationProvider provider = google.getIfAvailable();
            if (provider == null) {
                throw new com.shreya.moodify.exception.ApiExceptions.BadRequest(
                        "Google Translation provider unavailable: Google provider was not initialized.");
            }
            String configurationError = provider.configurationError();
            if (configurationError != null) {
                throw new com.shreya.moodify.exception.ApiExceptions.BadRequest(configurationError);
            }
            return provider.translate(text, sourceLanguage, targetLanguage);
        }
        return myMemory.translate(text, sourceLanguage, targetLanguage);
    }
}
