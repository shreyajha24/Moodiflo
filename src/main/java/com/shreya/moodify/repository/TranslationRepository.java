package com.shreya.moodify.repository;

import com.shreya.moodify.entity.Song;
import com.shreya.moodify.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TranslationRepository extends JpaRepository<Translation, Long> {
    Optional<Translation> findBySongAndSourceLanguageAndTargetLanguage(Song s, String source, String target);
    List<Translation> findBySong(Song s);
    void deleteBySong(Song s);
}
