package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="lyrics", uniqueConstraints=@UniqueConstraint(columnNames={"song_id","language"}))
public class Lyrics { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private Song song; private String language; @Lob @Column(nullable=false) private String lyricsText; }
