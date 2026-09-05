package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="playlists")
public class Playlist { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String name; private String description; private String coverImageUrl; @ManyToOne(optional=false) private User user; private Instant createdAt=Instant.now(); }
