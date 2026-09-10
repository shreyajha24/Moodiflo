package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.SongView;
import com.shreya.moodify.discovery.DiscoveryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discovery")
public class DiscoveryController {
    private final DiscoveryService discovery;
    private final com.shreya.moodify.service.SpotifyService spotify;
    public DiscoveryController(DiscoveryService discovery, com.shreya.moodify.service.SpotifyService spotify) { this.discovery = discovery; this.spotify = spotify; }

    @GetMapping("/mood/{mood}")
    public List<SongView> mood(@PathVariable String mood, @RequestParam(defaultValue = "20") int limit, Authentication authentication) {
        if (mood.length() > 40 || limit < 1 || limit > 50) throw new IllegalArgumentException("Invalid mood discovery request.");
        String email = authentication == null ? null : authentication.getName();
        List<SongView> result = discovery.discoverMood(mood, email, limit);
        return result.isEmpty() ? spotify.searchByMood(mood, email, 0, Math.min(limit, 10)) : result;
    }

    @GetMapping("/journey")
    public List<SongView> journey(@RequestParam(defaultValue = "12") int limit, Authentication authentication) {
        if (authentication == null) throw new org.springframework.security.access.AccessDeniedException("Sign in to build Journey recommendations.");
        if (limit < 1 || limit > 20) throw new IllegalArgumentException("limit must be between 1 and 20");
        return discovery.discoverForJourney(authentication.getName(), limit);
    }
}
