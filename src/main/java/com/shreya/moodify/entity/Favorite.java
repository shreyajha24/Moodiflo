package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="favorites", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","song_id"}))
public class Favorite { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private User user; @ManyToOne(optional=false) private Song song; private Instant createdAt=Instant.now(); }
