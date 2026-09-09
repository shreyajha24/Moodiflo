package com.shreya.moodify.config;
import com.shreya.moodify.entity.*;
import com.shreya.moodify.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class SeedDataConfig {

    @Value("${app.demo-mode:false}")
    private boolean demoMode;

    @Bean
    public CommandLineRunner seed(MoodRepository mr,
                                  SongRepository sr,
                                  SongMoodRepository smr,
                                  UserRepository ur,
                                  LyricsRepository lr,
                                  TranslationRepository tr,
                                  FavoriteRepository fr,
                                  HistoryRepository hr,
                                  PlaylistSongRepository psr,
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

            // Older releases inserted local placeholder tracks into the persistent
            // database. They must never leak into the production catalog or player.
            // Spotify is the only source for discovery music now.
            if (!demoMode) {
                sr.findAll().stream()
                        .filter(this::isLegacyDemoSong)
                        .forEach(song -> {
                            smr.deleteAll(smr.findBySong(song));
                            lr.deleteBySong(song);
                            tr.deleteBySong(song);
                            fr.deleteBySong(song);
                            hr.deleteBySong(song);
                            psr.deleteBySong(song);
                            sr.delete(song);
                        });
                sr.flush();
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

            // Demo credentials are development-only and disabled in production.
            if (demoMode) {
                if (ur.findByEmailIgnoreCase("demo@moodify.local").isEmpty()) {
                    User u = new User();
                    u.setName("Demo User");
                    u.setEmail("demo@moodify.local");
                    u.setPassword(pe.encode("DemoUser123!"));
                    u.setRole(User.Role.USER);
                    u.setPreferredLanguage("English");
                    ur.save(u);
                }
            } else {
                ur.findByEmailIgnoreCase("demo@moodify.local").ifPresent(u -> {
                    u.setEmail("disabled_demo_" + u.getId() + "@moodify.invalid");
                    u.setPassword("DISABLED_" + java.util.UUID.randomUUID());
                    u.setRole(User.Role.USER);
                    ur.save(u);
                });
            }
        };
    }

    private boolean isLegacyDemoSong(Song song) {
        String title = song.getTitle() == null ? "" : song.getTitle();
        String artist = song.getArtist() == null ? "" : song.getArtist();
        String description = song.getDescription() == null ? "" : song.getDescription();
        return title.regionMatches(true, 0, "Moodify Demo", 0, "Moodify Demo".length())
                || artist.regionMatches(true, 0, "Demo Artist", 0, "Demo Artist".length())
                || description.toLowerCase().contains("demo audio");
    }
}
