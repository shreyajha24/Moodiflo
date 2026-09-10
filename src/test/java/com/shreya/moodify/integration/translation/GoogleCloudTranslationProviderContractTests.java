package com.shreya.moodify.integration.translation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GoogleCloudTranslationProviderContractTests {
    @Test
    void usesGoogleTranslationV2RequestAndResponseShape() throws Exception {
        assertThat(GoogleCloudTranslationProvider.TRANSLATE_URL)
                .isEqualTo("https://translation.googleapis.com/language/translate/v2");

        Map<String, Object> request = GoogleCloudTranslationProvider.translationRequest(
                "Hello, how are you?", "en-US", "hi-IN");

        assertThat(request).containsEntry("q", "Hello, how are you?")
                .containsEntry("source", "en")
                .containsEntry("target", "hi")
                .containsEntry("format", "text")
                .doesNotContainKeys("sourceLanguageCode", "targetLanguageCode", "contents", "mimeType");

        assertThat(GoogleCloudTranslationProvider.parseTranslationResponse(
                new ObjectMapper(), "{\"data\":{\"translations\":[{\"translatedText\":\"नमस्ते\"}]}}"))
                .isEqualTo("नमस्ते");
    }

    @Test
    void normalizesSupportedCodesAndLocaleVariants() {
        assertThat(GoogleCloudTranslationProvider.normalizeCode("en")).isEqualTo("en");
        assertThat(GoogleCloudTranslationProvider.normalizeCode("hi-IN")).isEqualTo("hi");
        assertThat(GoogleCloudTranslationProvider.normalizeCode("fr-FR")).isEqualTo("fr");
        assertThat(GoogleCloudTranslationProvider.normalizeCode("de-DE")).isEqualTo("de");
        assertThat(GoogleCloudTranslationProvider.normalizeCode("es-ES")).isEqualTo("es");
        assertThat(GoogleCloudTranslationProvider.normalizeCode("it-IT")).isEqualTo("it");
        assertThat(GoogleCloudTranslationProvider.normalizeCode("ja-JP")).isEqualTo("ja");
        assertThatThrownBy(() -> GoogleCloudTranslationProvider.normalizeCode("xx"))
                .hasMessageContaining("Unsupported Google translation language code");
    }
}
