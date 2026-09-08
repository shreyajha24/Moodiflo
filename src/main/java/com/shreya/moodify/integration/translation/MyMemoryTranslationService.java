package com.shreya.moodify.integration.translation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shreya.moodify.config.TranslationConfig;
import com.shreya.moodify.exception.ApiExceptions;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class MyMemoryTranslationService implements TranslationService {
    private final WebClient client;
    private final ObjectMapper mapper;
    private final TranslationConfig config;

    public MyMemoryTranslationService(WebClient.Builder builder, ObjectMapper mapper, TranslationConfig config) {
        this.client = builder.build();
        this.mapper = mapper;
        this.config = config;
    }

    @Override
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.isBlank()) {
            throw new ApiExceptions.BadRequest("There are no lyrics to translate.");
        }
        String source = languageCode(sourceLanguage);
        String target = languageCode(targetLanguage);
        if (source.equals(target)) return text;
        try {
            String body = client.get()
                    .uri(config.getUrl() + "?q=" + encode(text) + "&langpair=" + encode(source + "|" + target))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            JsonNode response = mapper.readTree(body).path("responseData").path("translatedText");
            if (!response.isTextual() || response.asText().isBlank()) {
                throw new ApiExceptions.BadRequest("The translation provider returned no translation.");
            }
            return response.asText();
        } catch (ApiExceptions.BadRequest ex) {
            throw ex;
        } catch (WebClientResponseException | JsonProcessingException | IllegalStateException ex) {
            throw new ApiExceptions.BadRequest("Translation is temporarily unavailable. Please retry.");
        }
    }

    private static String languageCode(String language) {
        return switch (language == null ? "" : language.trim().toLowerCase()) {
            case "english" -> "en";
            case "hindi" -> "hi";
            case "spanish" -> "es";
            case "french" -> "fr";
            case "japanese" -> "ja";
            case "korean" -> "ko";
            case "portuguese" -> "pt";
            case "german" -> "de";
            default -> language == null || language.isBlank() ? "en" : language.substring(0, Math.min(2, language.length())).toLowerCase();
        };
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
