package com.shreya.moodify.repository;

import com.shreya.moodify.entity.ListeningHistory;
import com.shreya.moodify.entity.Song;
import com.shreya.moodify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoryRepository extends JpaRepository<ListeningHistory, Long> {
    List<ListeningHistory> findTop20ByUserOrderByPlayedAtDesc(User u);
    void deleteBySong(Song s);
}
