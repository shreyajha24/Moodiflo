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

                String[] langs = {"English", "Hindi", "Spanish", "Korean", "French"};
                String[] genres = {"Indie", "Acoustic", "Pop", "Lo-Fi", "Rock"};

                for (int i = 0; i < 20; i++) {
                    Song s = new Song();
                    s.setTitle("Moodify Demo " + (i + 1));
                    s.setArtist("Demo Artist " + (i % 5 + 1));
                    s.setAlbum("Emotional Soundtracks Vol. " + (i % 3 + 1));
                    s.setLanguage(langs[i % langs.length]);
                    s.setGenre(genres[i % genres.length]);
                    s.setDuration(180 + (i * 7));
                    s.setPopularity(0.4 + (i % 6) * 0.1);
                    s.setReleaseDate(LocalDate.now().minusMonths(i * 2L));
                    // SoundHelix provides stable, CORS-enabled demo audio so a fresh
                    // local install is playable without Spotify credentials.
                    s.setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-" + ((i % 16) + 1) + ".mp3");
                    s.setCoverImageUrl("https://placehold.co/600x600?text=Moodify+" + (i + 1));
                    s.setDescription("Demo audio for local development.");
                    s = sr.save(s);

                    smr.save(new SongMood(s, ms.get(i % ms.size()), 0.65 + (i % 4) * 0.08));
                    smr.save(new SongMood(s, ms.get((i + 5) % ms.size()), 0.45));

                    // Seed sample lyrics for first 10 songs
                    if (i < 10) {
                        Lyrics l = new Lyrics();
                        l.setSong(s);
                        l.setLanguage(s.getLanguage());
                        l.setLyricsText("Verse 1:\nWalking through the melodies of " + s.getTitle() + ".\n"
                                + "Chorus:\nMoodify feels just right, melodies take flight in the silent night.\n"
                                + "Outro:\nHarmony and solace found.");
                        lr.save(l);
                    }
                }
            } else if (lr.count() == 0 && sr.count() > 0) {
                // If songs exist but lyrics were missing from earlier run, seed lyrics
                List<Song> existingSongs = sr.findAll();
                for (int i = 0; i < Math.min(10, existingSongs.size()); i++) {
                    Song s = existingSongs.get(i);
                    Lyrics l = new Lyrics();
                    l.setSong(s);
                    l.setLanguage(s.getLanguage() != null ? s.getLanguage() : "English");
                    l.setLyricsText("Verse 1:\nWalking through the melodies of " + s.getTitle() + ".\n"
                            + "Chorus:\nMoodify feels just right, melodies take flight in the silent night.\n"
                            + "Outro:\nHarmony and solace found.");
                    lr.save(l);
                }
            }

            // Repair installations created by the old demo seed without changing
            // user-owned songs or any Spotify/provider metadata.
            sr.findAll().forEach(s -> {
                if (s.getAudioUrl() != null && s.getAudioUrl().contains("example.com")) {
                    s.setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-" + (((s.getId() == null ? 1 : s.getId()) - 1) % 16 + 1) + ".mp3");
                    sr.save(s);
                }
            });

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
