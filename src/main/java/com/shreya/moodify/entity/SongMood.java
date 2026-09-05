package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="song_moods", uniqueConstraints=@UniqueConstraint(columnNames={"song_id","mood_id"}))
public class SongMood { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private Song song; @ManyToOne(optional=false) private Mood mood; @Column(nullable=false) private Double moodScore; public SongMood(Song s,Mood m,Double score){song=s;mood=m;moodScore=score;} }
