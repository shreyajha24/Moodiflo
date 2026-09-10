package com.shreya.moodify.integration.translation;

import com.shreya.moodify.config.TranslationConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/** Selects Google when enabled and usable, while retaining the real MyMemory fallback. */
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

    @Override
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        GoogleCloudTranslationProvider provider = google.getIfAvailable();
        if (config.isGoogleEnabled() && provider != null && provider.isConfigured()) {
            try {
                return provider.translate(text, sourceLanguage, targetLanguage);
            } catch (RuntimeException ex) {
                log.warn("[Translation] Google provider failed; using MyMemory fallback: {}", ex.getMessage());
            }
        } else if (config.isGoogleEnabled()) {
            log.warn("[Translation] Google provider is unavailable; using MyMemory fallback.");
        }
        return myMemory.translate(text, sourceLanguage, targetLanguage);
    }
}
