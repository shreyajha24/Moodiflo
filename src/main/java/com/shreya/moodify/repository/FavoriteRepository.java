package com.shreya.moodify.repository;

import com.shreya.moodify.entity.Favorite;
import com.shreya.moodify.entity.Song;
import com.shreya.moodify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserAndSong(User u, Song s);
    void deleteByUserAndSong(User u, Song s);
    void deleteBySong(Song s);
    List<Favorite> findByUserOrderByCreatedAtDesc(User u);
}
