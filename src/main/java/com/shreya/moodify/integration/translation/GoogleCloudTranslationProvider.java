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
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.http.ResponseEntity;
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
    static final String TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";
    private final TranslationConfig config;
    private final ObjectMapper mapper;
    private final WebClient client;
    private volatile AccessToken accessToken;
    private volatile String startupConfigurationError;

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
        startupConfigurationError = error;
        if (error != null) log.error("[Translation] Google Translation provider unavailable: {}", error);
        else log.info("[Translation] Google Translation provider enabled for project {}.", config.getGoogleProject());
    }

    public boolean isConfigured() { return configurationError() == null; }

    public String configurationError() {
        String configError = config.googleConfigurationError();
        return configError != null ? configError : startupConfigurationError;
    }

    @Override
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.isBlank()) throw new ApiExceptions.BadRequest("There are no lyrics to translate.");
        String configurationError = configurationError();
        if (configurationError != null) throw new ApiExceptions.BadRequest(configurationError);
        try {
            String source = normalizeCode(sourceLanguage);
            String target = normalizeCode(targetLanguage);
            log.info("[Translation] provider=google endpoint={} project={} source={} target={}",
                    TRANSLATE_URL, config.getGoogleProject(), source, target);
            String bearer = token();
            ResponseEntity<String> response = client.post().uri(TRANSLATE_URL).headers(h -> {
                        h.setBearerAuth(bearer);
                        h.set("X-Goog-User-Project", config.getGoogleProject());
                    })
                    .bodyValue(translationRequest(text, source, target))
                    .retrieve().toEntity(String.class).block(Duration.ofSeconds(12));
            int status = response == null ? 0 : response.getStatusCode().value();
            log.info("[Translation] provider=google status={}", status);
            return parseTranslationResponse(mapper, response == null ? null : response.getBody());
        } catch (ApiExceptions.BadRequest ex) { throw ex; }
        catch (WebClientResponseException ex) {
            log.warn("[Translation] provider=google status={} error={}", ex.getStatusCode().value(), googleErrorMessage(ex));
            throw new ApiExceptions.BadRequest("Google Translation request failed. Check the Google project, credentials, API enablement, and language codes.");
        } catch (Exception ex) {
            log.warn("[Translation] Google request failed: {}", ex.getClass().getSimpleName());
            throw new ApiExceptions.BadRequest("Google Translation is unavailable. Check the configured credentials and try again.");
        }
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

    static String normalizeCode(String language) {
        String value = language == null || language.isBlank() ? "en" : language.trim().toLowerCase(Locale.ROOT);
        int separator = value.indexOf('-');
        if (separator > 0) value = value.substring(0, separator);
        return switch (value) {
            case "english", "en" -> "en";
            case "hindi", "hi" -> "hi";
            case "spanish", "es" -> "es";
            case "french", "fr" -> "fr";
            case "japanese", "ja" -> "ja";
            case "german", "de" -> "de";
            case "italian", "it" -> "it";
            default -> throw new ApiExceptions.BadRequest("Unsupported Google translation language code: " + value);
        };
    }

    private String googleErrorMessage(WebClientResponseException ex) {
        try {
            JsonNode error = mapper.readTree(ex.getResponseBodyAsString()).path("error").path("message");
            return error.isTextual() && !error.asText().isBlank() ? error.asText() : ex.getStatusText();
        } catch (Exception ignored) {
            return ex.getStatusText();
        }
    }

    static Map<String, Object> translationRequest(String text, String sourceLanguage, String targetLanguage) {
        return Map.of(
                "q", text,
                "source", normalizeCode(sourceLanguage),
                "target", normalizeCode(targetLanguage),
                "format", "text"
        );
    }

    static String parseTranslationResponse(ObjectMapper mapper, String body) throws IOException {
        JsonNode translated = mapper.readTree(body == null ? "{}" : body)
                .path("data").path("translations").path(0).path("translatedText");
        if (!translated.isTextual() || translated.asText().isBlank()) {
            throw new ApiExceptions.BadRequest("The translation provider returned no translation.");
        }
        return translated.asText();
    }
    private record AccessToken(String value, Instant expiresAt) { }
}
