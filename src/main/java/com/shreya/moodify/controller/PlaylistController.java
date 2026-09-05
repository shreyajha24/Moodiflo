package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.FeatureService;
import com.shreya.moodify.service.PlaylistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    private final FeatureService service;
    private final PlaylistService playlistService;

    public PlaylistController(FeatureService x, PlaylistService p) {
        this.service = x;
        this.playlistService = p;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlaylistView create(Authentication a, @Valid @RequestBody PlaylistRequest r) {
        return service.create(a.getName(), r);
    }

    @GetMapping
    public List<PlaylistView> all(Authentication a) {
        return service.playlists(a.getName());
    }

    @GetMapping("/{id}")
    public PlaylistView one(Authentication a, @PathVariable Long id) {
        return playlistService.one(a.getName(), id);
    }

    @PutMapping("/{id}")
    public PlaylistView update(Authentication a, @PathVariable Long id, @Valid @RequestBody PlaylistRequest r) {
        return playlistService.update(a.getName(), id, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication a, @PathVariable Long id) {
        playlistService.delete(a.getName(), id);
    }

    @GetMapping("/{playlistId}/songs")
    public List<SongView> songs(Authentication a, @PathVariable Long playlistId) {
        return playlistService.songList(a.getName(), playlistId);
    }

    @PostMapping("/{playlistId}/songs/{songId}")
    public PlaylistView add(Authentication a, @PathVariable Long playlistId, @PathVariable Long songId) {
        return service.add(a.getName(), playlistId, songId);
    }

    @DeleteMapping("/{playlistId}/songs/{songId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(Authentication a, @PathVariable Long playlistId, @PathVariable Long songId) {
        service.remove(a.getName(), playlistId, songId);
    }
}
