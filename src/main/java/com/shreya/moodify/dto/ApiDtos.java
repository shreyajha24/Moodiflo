package com.shreya.moodify.dto;
import jakarta.validation.constraints.*; import java.time.*; import java.util.*;
public final class ApiDtos { private ApiDtos(){}
 public record UserView(Long id,String name,String email,String profileImage,String preferredLanguage){}
 public record RegisterRequest(@NotBlank String name,@Email @NotBlank String email,@NotBlank @Size(min=8) String password,String preferredLanguage){}
 public record LoginRequest(@Email @NotBlank String email,@NotBlank String password){}
 public record AuthResponse(String token,UserView user){}
 public record SongRequest(@NotBlank String title,@NotBlank String artist,String album,@Positive Integer duration,String audioUrl,String coverImageUrl,String language,String genre,LocalDate releaseDate,String description,@DecimalMin("0") @DecimalMax("1") Double popularity){}
 public record SongView(Long id,String title,String artist,String album,Integer duration,String audioUrl,String coverImageUrl,String language,String genre,LocalDate releaseDate,String description,String spotifyUri,String spotifyTrackId,String provider,String providerTrackId){}
 public record MusicPageResponse(String mood,List<SongView> songs,int page,int limit,boolean hasMore){}
 public record MoodView(Long id,String name,String description,String emoji,Double intensity,List<String> recommendedGenres){}
 public record MoodRequest(@NotBlank @Size(max=40) String name,String description,String emoji,@DecimalMin("0") @DecimalMax("1") Double intensity,String recommendedGenres){}
 public record MoodSessionRequest(@NotBlank String mood,@DecimalMin("0") @DecimalMax("1") Double intensity,String language){}
 public record MoodSessionResponse(String sessionId,String mood,String playlistName,List<SongView> songs){}
 public record TranslationRequest(@NotBlank String targetLanguage){}
 public record TranslationView(Long songId,String songTitle,String sourceLanguage,String targetLanguage,String originalLyrics,String translatedLyrics){}
 public record HistoryRequest(@NotNull Long songId,@NotNull @Min(0) @Max(100) Integer completionPercentage,String selectedMood){}
 public record PlaylistRequest(@NotBlank String name,String description,String coverImageUrl){}
 public record PlaylistView(Long id,String name,String description,String coverImageUrl,List<SongView> songs){}
 public record PageResponse<T>(List<T> content,int page,int size,long totalElements,int totalPages){}
 public record DiscoveryResponse(String greeting,String suggestedMood,List<MoodView> moodCards,List<SongView> continueListening,List<SongView> becauseYouListened,List<SongView> recentlyPlayed,List<SongView> recommendedForYou,List<SongView> trending){}
 public record QueryRequest(@NotBlank String query){}
 public record QueryResponse(String interpretedMood,double confidence,List<SongView> songs){}
 // Spotify-specific DTOs
 public record SpotifyStatusView(boolean connected,boolean configured,String displayName,String product){}
 public record SpotifyAuthUrlView(String authUrl){}
 public record SpotifyTokenView(String accessToken){}
 public record SargamPlaceView(String displayName,Double latitude,Double longitude,String country,List<SongView> tracks){}
}
