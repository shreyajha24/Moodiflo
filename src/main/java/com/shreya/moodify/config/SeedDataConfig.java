package com.shreya.moodify.config;

import com.shreya.moodify.service.StartupDataService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedDataConfig {

    @Bean
    public CommandLineRunner seed(StartupDataService startupDataService) {
        return args -> startupDataService.initialize();
    }

    /**
     * One-time operator-controlled maintenance runner. This bean does not
     * exist unless PURGE_LEGACY_DEMO_DATA=true is explicitly configured.
     */
    @Bean
    @ConditionalOnProperty(name = "app.purge-legacy-demo-data", havingValue = "true")
    public CommandLineRunner purgeLegacyDemoData(StartupDataService startupDataService) {
        return args -> startupDataService.purgeLegacyDemoSongs();
    }
}
