package com.shreya.moodify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TranslationConfig {
    @Value("${app.translation.url:https://api.mymemory.translated.net/get}")
    private String url;

    public String getUrl() {
        return url;
    }
}
