package com.shreya.moodify.repository; import com.shreya.moodify.entity.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface PlaylistRepository extends JpaRepository<Playlist,Long>{List<Playlist> findByUserOrderByCreatedAtDesc(User u);}
