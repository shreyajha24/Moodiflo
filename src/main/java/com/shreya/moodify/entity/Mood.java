package com.shreya.moodify.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Getter @Setter @NoArgsConstructor @Table(name="moods", uniqueConstraints=@UniqueConstraint(columnNames="name"))
public class Mood { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String name; private String description; private String emoji; private Double intensity=1.0; private String recommendedGenres; }
