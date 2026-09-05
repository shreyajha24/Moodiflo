package com.shreya.moodify.repository;

import com.shreya.moodify.entity.Mood;
import com.shreya.moodify.entity.Song;
import com.shreya.moodify.entity.SongMood;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SongMoodRepository extends JpaRepository<SongMood, Long> {
    List<SongMood> findByMoodOrderByMoodScoreDesc(Mood mood);
    List<SongMood> findBySong(Song song);
    void deleteBySong(Song song);
}
