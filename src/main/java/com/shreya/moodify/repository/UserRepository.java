package com.shreya.moodify.repository; import com.shreya.moodify.entity.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long>{Optional<User> findByEmailIgnoreCase(String email);}
