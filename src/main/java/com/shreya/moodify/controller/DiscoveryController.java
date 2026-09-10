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
    public DiscoveryController(DiscoveryService discovery) { this.discovery = discovery; }

    @GetMapping("/mood/{mood}")
    public List<SongView> mood(@PathVariable String mood, @RequestParam(defaultValue = "20") int limit, Authentication authentication) {
        if (mood.length() > 40 || limit < 1 || limit > 50) throw new IllegalArgumentException("Invalid mood discovery request.");
        return discovery.discoverMood(mood, authentication == null ? null : authentication.getName(), limit);
    }
}
