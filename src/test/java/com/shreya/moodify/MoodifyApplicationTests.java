package com.shreya.moodify;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
class MoodifyApplicationTests {

    @DynamicPropertySource
    static void testProperties(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> "test-generated-jwt-secret-012345678901234567890123");
    }

    @Test
    void contextLoads() {
    }

}
