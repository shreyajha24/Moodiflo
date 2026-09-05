package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate; import java.time.Instant;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="songs")
public class Song { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String title; @Column(nullable=false) private String artist; private String album; private Integer duration; private String audioUrl; private String coverImageUrl; private String language; private String genre; private LocalDate releaseDate; @Column(length=2000) private String description; private Instant createdAt=Instant.now(); private Double popularity=0.0; }
