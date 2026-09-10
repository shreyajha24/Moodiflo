package com.shreya.moodify;

import com.shreya.moodify.config.TranslationConfig;
import com.shreya.moodify.integration.translation.GoogleCloudTranslationProvider;
import com.shreya.moodify.integration.translation.MyMemoryTranslationService;
import com.shreya.moodify.integration.translation.TranslationServiceRouter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class TranslationConfigurationTests {
    @Test
    void disabledGoogleUsesMyMemory() {
        TranslationConfig config = config(false, "project", "missing.json");
        MyMemoryTranslationService myMemory = mock(MyMemoryTranslationService.class);
        when(myMemory.translate(anyString(), anyString(), anyString())).thenReturn("fallback");
        TranslationServiceRouter router = new TranslationServiceRouter(config, myMemory, unavailableGoogle());

        assertThat(router.translate("hello", "English", "Hindi")).isEqualTo("fallback");
        verify(myMemory).translate("hello", "English", "Hindi");
    }

    @Test
    void validGoogleConfigurationSelectsGoogleProvider() throws Exception {
        Path credentials = Files.createTempFile("moodiflo-google-test", ".json");
        try {
            Files.writeString(credentials, "{\"client_email\":\"test@example.com\",\"private_key\":\"test\"}");
            TranslationConfig config = config(true, "project-moodiflo", credentials.toString());
            GoogleCloudTranslationProvider google = mock(GoogleCloudTranslationProvider.class);
            when(google.isConfigured()).thenReturn(true);
            when(google.translate(anyString(), anyString(), anyString())).thenReturn("translated");
            MyMemoryTranslationService myMemory = mock(MyMemoryTranslationService.class);
            TranslationServiceRouter router = new TranslationServiceRouter(config, myMemory, provider(google));

            assertThat(router.translate("hello", "English", "Hindi")).isEqualTo("translated");
            verify(google).translate("hello", "English", "Hindi");
            verifyNoInteractions(myMemory);
        } finally {
            Files.deleteIfExists(credentials);
        }
    }

    @Test
    void reportsMissingProjectAndCredentialsAndMissingFile() {
        assertThat(config(true, "", "credentials.json").googleConfigurationError()).contains("PROJECT_ID");
        assertThat(config(true, "project", "").googleConfigurationError()).contains("CREDENTIALS");
        assertThat(config(true, "project", "does-not-exist.json").googleConfigurationError()).contains("does not exist");
    }

    private TranslationConfig config(boolean enabled, String project, String credentials) {
        TranslationConfig config = new TranslationConfig();
        ReflectionTestUtils.setField(config, "googleEnabled", enabled);
        ReflectionTestUtils.setField(config, "googleProject", project);
        ReflectionTestUtils.setField(config, "googleCredentials", credentials);
        return config;
    }

    private ObjectProvider<GoogleCloudTranslationProvider> unavailableGoogle() {
        ObjectProvider<GoogleCloudTranslationProvider> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(null);
        return provider;
    }

    private ObjectProvider<GoogleCloudTranslationProvider> provider(GoogleCloudTranslationProvider google) {
        ObjectProvider<GoogleCloudTranslationProvider> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(google);
        return provider;
    }
}
