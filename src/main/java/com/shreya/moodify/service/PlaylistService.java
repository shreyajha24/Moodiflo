package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.Playlist;
import com.shreya.moodify.exception.ApiExceptions.*;
import com.shreya.moodify.repository.PlaylistRepository;
import com.shreya.moodify.repository.PlaylistSongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PlaylistService {

    private final SongService songs;
    private final PlaylistRepository playlists;
    private final PlaylistSongRepository items;

    public PlaylistService(SongService s, PlaylistRepository p, PlaylistSongRepository i) {
        this.songs = s;
        this.playlists = p;
        this.items = i;
    }

    @Transactional(readOnly = true)
    public Playlist own(String email, Long id) {
        Playlist p = playlists.findById(id).orElseThrow(() -> new NotFound("Playlist not found"));
        if (!p.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new Forbidden("Playlist belongs to another user");
        }
        return p;
    }

    @Transactional(readOnly = true)
    public PlaylistView view(Playlist p) {
        List<SongView> songList = items.findByPlaylistOrderByPositionAsc(p).stream()
                .map(x -> songs.view(x.getSong()))
                .toList();
        return new PlaylistView(p.getId(), p.getName(), p.getDescription(), p.getCoverImageUrl(), songList);
    }

    @Transactional(readOnly = true)
    public PlaylistView one(String email, Long id) {
        return view(own(email, id));
    }

    public PlaylistView update(String email, Long id, PlaylistRequest r) {
        Playlist p = own(email, id);
        p.setName(r.name());
        p.setDescription(r.description());
        p.setCoverImageUrl(r.coverImageUrl());
        return view(playlists.save(p));
    }

    public void delete(String email, Long id) {
        Playlist p = own(email, id);
        items.findByPlaylistOrderByPositionAsc(p).forEach(items::delete);
        playlists.delete(p);
    }

    @Transactional(readOnly = true)
    public List<SongView> songList(String email, Long id) {
        return items.findByPlaylistOrderByPositionAsc(own(email, id)).stream()
                .map(x -> songs.view(x.getSong()))
                .toList();
    }
}
