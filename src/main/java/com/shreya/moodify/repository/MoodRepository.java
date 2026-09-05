package com.shreya.moodify.repository; import com.shreya.moodify.entity.Mood; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface MoodRepository extends JpaRepository<Mood,Long>{Optional<Mood> findByNameIgnoreCase(String name);}
