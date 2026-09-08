package com.shreya.moodify.config;
import com.shreya.moodify.entity.*;
import com.shreya.moodify.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class SeedDataConfig {

    @Bean
    public CommandLineRunner seed(MoodRepository mr,
                                  SongRepository sr,
                                  SongMoodRepository smr,
                                  UserRepository ur,
                                  LyricsRepository lr,
                                  PasswordEncoder pe) {
        return args -> {
            if (mr.count() == 0) {
                String[] names = {"HAPPY", "CALM", "ENERGETIC", "SAD", "ROMANTIC", "NOSTALGIC", "FOCUS", "ANGRY", "DREAMY", "MELANCHOLIC", "PARTY", "HOPEFUL"};
                List<Mood> ms = new ArrayList<>();
                for (String n : names) {
                    Mood m = new Mood();
                    m.setName(n);
                    m.setDescription("Songs that meet your " + n.toLowerCase() + " mood.");
                    m.setEmoji("♪");
                    m.setRecommendedGenres("Indie,Acoustic,Pop");
                    ms.add(mr.save(m));
                }

            }

            // Demote and disable any legacy admin account to eliminate backdoor credentials
            ur.findByEmailIgnoreCase("admin@moodify.local").ifPresent(u -> {
                u.setEmail("disabled_admin_" + u.getId() + "@moodify.invalid");
                u.setPassword("DISABLED_" + java.util.UUID.randomUUID());
                u.setRole(User.Role.USER);
                ur.save(u);
            });

            // Also reset any lingering ADMIN roles to USER in the database
            ur.findAll().forEach(u -> {
                if (u.getRole() == User.Role.ADMIN) {
                    u.setRole(User.Role.USER);
                    ur.save(u);
                }
            });

            // Seed a standard non-privileged demo user for evaluation
            if (ur.findByEmailIgnoreCase("demo@moodify.local").isEmpty()) {
                User u = new User();
                u.setName("Demo User");
                u.setEmail("demo@moodify.local");
                u.setPassword(pe.encode("DemoUser123!"));
                u.setRole(User.Role.USER);
                u.setPreferredLanguage("English");
                ur.save(u);
            }
        };
    }
}
