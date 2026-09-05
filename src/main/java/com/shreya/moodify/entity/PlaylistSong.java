package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="playlist_songs", uniqueConstraints=@UniqueConstraint(columnNames={"playlist_id","song_id"}))
public class PlaylistSong { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private Playlist playlist; @ManyToOne(optional=false) private Song song; private Integer position; private Instant addedAt=Instant.now(); }
