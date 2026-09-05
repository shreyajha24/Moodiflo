package com.shreya.moodify.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="users") @Getter @Setter @NoArgsConstructor
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false, unique=true) private String email;
    @Column(nullable=false) private String password;
    private String profileImage;
    private String preferredLanguage;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role=Role.USER;
    private Instant createdAt=Instant.now(); private Instant updatedAt=Instant.now();
    public enum Role { USER, ADMIN }
}
