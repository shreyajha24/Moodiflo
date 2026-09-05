package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="translations", uniqueConstraints=@UniqueConstraint(columnNames={"song_id","sourceLanguage","targetLanguage"}))
public class Translation { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private Song song; private String sourceLanguage; private String targetLanguage; @Lob private String originalLyrics; @Lob private String translatedLyrics; private Instant createdAt=Instant.now(); }
