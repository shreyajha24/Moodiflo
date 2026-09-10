package com.shreya.moodify.integration.translation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shreya.moodify.config.TranslationConfig;
import com.shreya.moodify.exception.ApiExceptions;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;

/** Official Google Cloud Translation REST API adapter; credentials stay on the server. */
@Service
@ConditionalOnProperty(name = "app.translation.google-enabled", havingValue = "true")
public class GoogleCloudTranslationProvider implements TranslationService {
    private static final Logger log = LoggerFactory.getLogger(GoogleCloudTranslationProvider.class);
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";
    private final TranslationConfig config;
    private final ObjectMapper mapper;
    private final WebClient client;
    private volatile AccessToken accessToken;

    public GoogleCloudTranslationProvider(TranslationConfig config, ObjectMapper mapper, WebClient.Builder builder) {
        this.config = config; this.mapper = mapper; this.client = builder.build();
    }

    @PostConstruct
    void validateConfigurationAtStartup() {
        String error = config.googleConfigurationError();
        if (error == null) {
            try {
                JsonNode credentials = mapper.readTree(Files.readString(Path.of(config.getGoogleCredentials())));
                if (!credentials.path("client_email").isTextual() || !credentials.path("private_key").isTextual()) {
                    error = "Google credentials file is missing client_email or private_key.";
                }
            } catch (Exception ex) {
                error = "Google credentials file cannot be read or is not valid JSON.";
            }
        }
        if (error != null) log.error("[Translation] Google provider is enabled but unavailable: {} MyMemory fallback remains active.", error);
        else log.info("[Translation] Google Cloud Translation provider is configured.");
    }

    public boolean isConfigured() { return config.isGoogleConfigured(); }

    @Override
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.isBlank()) throw new ApiExceptions.BadRequest("There are no lyrics to translate.");
        String configurationError = config.googleConfigurationError();
        if (configurationError != null) throw new ApiExceptions.BadRequest(configurationError);
        try {
            String bearer = token();
            String body = client.post().uri(TRANSLATE_URL).headers(h -> h.setBearerAuth(bearer))
                    .bodyValue(Map.of("q", text, "source", code(sourceLanguage), "target", code(targetLanguage), "format", "text"))
                    .retrieve().bodyToMono(String.class).block(Duration.ofSeconds(12));
            JsonNode translated = mapper.readTree(body == null ? "{}" : body).path("data").path("translations").path(0).path("translatedText");
            if (!translated.isTextual() || translated.asText().isBlank()) throw new ApiExceptions.BadRequest("The translation provider returned no translation.");
            return translated.asText();
        } catch (ApiExceptions.BadRequest ex) { throw ex; }
        catch (Exception ex) { throw new ApiExceptions.BadRequest("Google translation is temporarily unavailable. Please retry."); }
    }

    private String token() throws Exception {
        if (accessToken != null && accessToken.expiresAt().isAfter(Instant.now().plusSeconds(60))) return accessToken.value();
        synchronized (this) {
            if (accessToken != null && accessToken.expiresAt().isAfter(Instant.now().plusSeconds(60))) return accessToken.value();
            JsonNode credentials = mapper.readTree(Files.readString(Path.of(config.getGoogleCredentials())));
            String email = credentials.path("client_email").asText();
            String privateKey = credentials.path("private_key").asText().replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replaceAll("\\s", "");
            long now = Instant.now().getEpochSecond();
            String unsigned = base64("{\"alg\":\"RS256\",\"typ\":\"JWT\"}") + "." + base64(mapper.writeValueAsString(Map.of("iss", email, "scope", "https://www.googleapis.com/auth/cloud-platform", "aud", TOKEN_URL, "iat", now, "exp", now + 3600)));
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKey))));
            signature.update(unsigned.getBytes(StandardCharsets.UTF_8));
            String assertion = unsigned + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(signature.sign());
            String response = client.post().uri(TOKEN_URL).bodyValue("grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + assertion)
                    .header("Content-Type", "application/x-www-form-urlencoded").retrieve().bodyToMono(String.class).block(Duration.ofSeconds(10));
            JsonNode token = mapper.readTree(response == null ? "{}" : response);
            accessToken = new AccessToken(token.path("access_token").asText(), Instant.now().plusSeconds(token.path("expires_in").asLong(3600)));
            if (accessToken.value().isBlank()) throw new IOException("No Google access token");
            return accessToken.value();
        }
    }

    private String base64(String value) { return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8)); }
    private String code(String language) { String value = language == null || language.isBlank() ? "en" : language.trim().toLowerCase(Locale.ROOT); return switch (value) { case "english" -> "en"; case "hindi" -> "hi"; case "spanish" -> "es"; case "french" -> "fr"; case "japanese" -> "ja"; case "korean" -> "ko"; case "german" -> "de"; case "portuguese" -> "pt"; default -> value.substring(0, Math.min(2, value.length())); }; }
    private record AccessToken(String value, Instant expiresAt) { }
}
