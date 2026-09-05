package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.*;
import com.shreya.moodify.exception.ApiExceptions.*;
import com.shreya.moodify.integration.translation.TranslationService;
import com.shreya.moodify.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FeatureService {

    private final UserService user;
    private final SongService song;
    private final FavoriteRepository fav;
    private final PlaylistRepository playlists;
    private final PlaylistSongRepository playlistSongs;
    private final HistoryRepository history;
    private final LyricsRepository lyrics;
    private final TranslationRepository translations;
    private final MoodRepository moods;
    private final TranslationService translator;

    public FeatureService(UserService u, SongService s, FavoriteRepository f, PlaylistRepository p,
                          PlaylistSongRepository ps, HistoryRepository h, LyricsRepository l,
                          TranslationRepository t, MoodRepository m, TranslationService tr) {
        this.user = u;
        this.song = s;
        this.fav = f;
        this.playlists = p;
        this.playlistSongs = ps;
        this.history = h;
        this.lyrics = l;
        this.translations = t;
        this.moods = m;
        this.translator = tr;
    }

    public User me(String email) {
        return user.byEmail(email);
    }

    @Transactional(readOnly = true)
    public UserView meView(String email) {
        User u = me(email);
        return new UserView(u.getId(), u.getName(), u.getEmail(), u.getProfileImage(), u.getPreferredLanguage());
    }

    public void favorite(String email, Long songId) {
        User u = me(email);
        Song s = song.get(songId);
        if (!fav.existsByUserAndSong(u, s)) {
            Favorite f = new Favorite();
            f.setUser(u);
            f.setSong(s);
            fav.save(f);
        }
    }

    public void unfavorite(String email, Long songId) {
        User u = me(email);
        Song s = song.get(songId);
        fav.deleteByUserAndSong(u, s);
    }

    @Transactional(readOnly = true)
    public List<SongView> favorites(String email) {
        return fav.findByUserOrderByCreatedAtDesc(me(email)).stream()
                .map(f -> song.view(f.getSong()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PlaylistView playlist(Playlist p) {
        List<SongView> songs = playlistSongs.findByPlaylistOrderByPositionAsc(p).stream()
                .map(ps -> song.view(ps.getSong()))
                .toList();
        return new PlaylistView(p.getId(), p.getName(), p.getDescription(), p.getCoverImageUrl(), songs);
    }

    public PlaylistView create(String email, PlaylistRequest r) {
        Playlist p = new Playlist();
        p.setUser(me(email));
        p.setName(r.name());
        p.setDescription(r.description());
        p.setCoverImageUrl(r.coverImageUrl());
        return playlist(playlists.save(p));
    }

    @Transactional(readOnly = true)
    public List<PlaylistView> playlists(String email) {
        return playlists.findByUserOrderByCreatedAtDesc(me(email)).stream()
                .map(this::playlist)
                .toList();
    }

    @Transactional(readOnly = true)
    public Playlist owner(String email, Long playlistId) {
        Playlist p = playlists.findById(playlistId)
                .orElseThrow(() -> new NotFound("Playlist not found"));
        if (!p.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new Forbidden("Playlist belongs to another user");
        }
        return p;
    }

    public PlaylistView add(String email, Long playlistId, Long songId) {
        Playlist p = owner(email, playlistId);
        Song s = song.get(songId);
        if (playlistSongs.findByPlaylistAndSong(p, s).isEmpty()) {
            PlaylistSong ps = new PlaylistSong();
            ps.setPlaylist(p);
            ps.setSong(s);
            ps.setPosition(playlistSongs.findByPlaylistOrderByPositionAsc(p).size() + 1);
            playlistSongs.save(ps);
        }
        return playlist(p);
    }

    public void remove(String email, Long playlistId, Long songId) {
        Playlist p = owner(email, playlistId);
        playlistSongs.findByPlaylistAndSong(p, song.get(songId))
                .ifPresent(playlistSongs::delete);
    }

    public void record(String email, HistoryRequest r) {
        ListeningHistory h = new ListeningHistory();
        h.setUser(me(email));
        h.setSong(song.get(r.songId()));
        h.setCompletionPercentage(r.completionPercentage());
        if (r.selectedMood() != null) {
            moods.findByNameIgnoreCase(r.selectedMood()).ifPresent(h::setSelectedMood);
        }
        history.save(h);
    }

    @Transactional(readOnly = true)
    public List<SongView> recent(String email) {
        return history.findTop20ByUserOrderByPlayedAtDesc(me(email)).stream()
                .map(h -> song.view(h.getSong()))
                .toList();
    }

    public TranslationView translate(String email, Long songId, TranslationRequest r) {
        Song s = song.get(songId);
        Lyrics l = lyrics.findBySong(s).stream().findFirst()
                .orElseThrow(() -> new NotFound("Lyrics not found"));
        Translation t = translations.findBySongAndSourceLanguageAndTargetLanguage(s, l.getLanguage(), r.targetLanguage())
                .orElseGet(() -> {
                    Translation n = new Translation();
                    n.setSong(s);
                    n.setSourceLanguage(l.getLanguage());
                    n.setTargetLanguage(r.targetLanguage());
                    n.setOriginalLyrics(l.getLyricsText());
                    n.setTranslatedLyrics(translator.translate(l.getLyricsText(), l.getLanguage(), r.targetLanguage()));
                    return translations.save(n);
                });
        return new TranslationView(songId, s.getTitle(), t.getSourceLanguage(), t.getTargetLanguage(), t.getOriginalLyrics(), t.getTranslatedLyrics());
    }

    @Transactional(readOnly = true)
    public List<TranslationView> translationList(Long songId) {
        Song s = song.get(songId);
        return translations.findBySong(s).stream()
                .map(t -> new TranslationView(songId, s.getTitle(), t.getSourceLanguage(), t.getTargetLanguage(), t.getOriginalLyrics(), t.getTranslatedLyrics()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> rawLyrics(Long songId) {
        return lyrics.findBySong(song.get(songId)).stream()
                .map(Lyrics::getLyricsText)
                .toList();
    }
}
