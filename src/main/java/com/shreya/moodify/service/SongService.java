package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.Song;
import com.shreya.moodify.exception.ApiExceptions.NotFound;
import com.shreya.moodify.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SongService {

    private final SongRepository repo;
    private final SongMoodRepository songMoodRepo;
    private final LyricsRepository lyricsRepo;
    private final TranslationRepository translationRepo;
    private final PlaylistSongRepository playlistSongRepo;
    private final FavoriteRepository favoriteRepo;
    private final HistoryRepository historyRepo;

    public SongService(SongRepository r,
                       SongMoodRepository songMoodRepo,
                       LyricsRepository lyricsRepo,
                       TranslationRepository translationRepo,
                       PlaylistSongRepository playlistSongRepo,
                       FavoriteRepository favoriteRepo,
                       HistoryRepository historyRepo) {
        this.repo = r;
        this.songMoodRepo = songMoodRepo;
        this.lyricsRepo = lyricsRepo;
        this.translationRepo = translationRepo;
        this.playlistSongRepo = playlistSongRepo;
        this.favoriteRepo = favoriteRepo;
        this.historyRepo = historyRepo;
    }

    public SongView view(Song s) {
        return new SongView(
                s.getId(),
                s.getTitle(),
                s.getArtist(),
                s.getAlbum(),
                s.getDuration(),
                s.getAudioUrl(),
                s.getCoverImageUrl(),
                s.getLanguage(),
                s.getGenre(),
                s.getReleaseDate(),
                s.getDescription(),
                null, // spotifyUri — not applicable for DB songs
                null, // spotifyTrackId — not applicable for DB songs
                "MOODIFLO",
                s.getId() == null ? null : s.getId().toString()
        );
    }

    @Transactional(readOnly = true)
    public Song get(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFound("Song not found"));
    }

    @Transactional(readOnly = true)
    public PageResponse<SongView> all(int page, int size) {
        Page<Song> p = repo.findAll(PageRequest.of(page, size, Sort.by("title")));
        return new PageResponse<>(p.map(this::view).getContent(), page, size, p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public PageResponse<SongView> search(String q, int page, int size) {
        String query = (q == null) ? "" : q.trim();
        Page<Song> p = repo.findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCaseOrAlbumContainingIgnoreCaseOrGenreContainingIgnoreCaseOrLanguageContainingIgnoreCase(
                query, query, query, query, query, PageRequest.of(page, size, Sort.by("title"))
        );
        return new PageResponse<>(p.map(this::view).getContent(), page, size, p.getTotalElements(), p.getTotalPages());
    }

    public Song save(SongRequest r) {
        return apply(new Song(), r);
    }

    public Song update(Long id, SongRequest r) {
        return apply(get(id), r);
    }

    private Song apply(Song s, SongRequest r) {
        s.setTitle(r.title());
        s.setArtist(r.artist());
        s.setAlbum(r.album());
        s.setDuration(r.duration());
        s.setAudioUrl(r.audioUrl());
        s.setCoverImageUrl(r.coverImageUrl());
        s.setLanguage(r.language());
        s.setGenre(r.genre());
        s.setReleaseDate(r.releaseDate());
        s.setDescription(r.description());
        s.setPopularity(r.popularity() == null ? 0.0 : r.popularity());
        return repo.save(s);
    }

    public void delete(Long id) {
        Song s = get(id);
        // Clean up all foreign key associations before deleting song
        songMoodRepo.deleteBySong(s);
        lyricsRepo.deleteBySong(s);
        translationRepo.deleteBySong(s);
        playlistSongRepo.deleteBySong(s);
        favoriteRepo.deleteBySong(s);
        historyRepo.deleteBySong(s);
        repo.delete(s);
    }
}
