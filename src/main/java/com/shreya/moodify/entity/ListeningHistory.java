package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="listening_history")
public class ListeningHistory { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private User user; @ManyToOne(optional=false) private Song song; @ManyToOne private Mood selectedMood; private Instant playedAt=Instant.now(); private Integer completionPercentage; }
