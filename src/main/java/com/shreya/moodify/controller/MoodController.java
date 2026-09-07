package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.MoodService;
import com.shreya.moodify.service.MusicProvider;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MoodController {

    private final MoodService service;

    public MoodController(MoodService s) {
        this.service = s;
    }

    @GetMapping("/moods")
    public List<MoodView> moods() {
        return service.all();
    }

    @GetMapping("/moods/{name}/recommendations")
    public MusicPageResponse recommendations(@PathVariable String name,
                                              Authentication authentication,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int limit) {
        String email = authentication == null ? null : authentication.getName();
        if (page < 0 || limit < 1 || limit > 50) {
            throw new IllegalArgumentException("page must be non-negative and limit must be between 1 and 50");
        }
        MusicProvider.MusicPage result = service.recommendationsPage(name, email, page, limit);
        return new MusicPageResponse(name.toUpperCase(), result.songs(), page, limit, result.hasMore());
    }


    @PostMapping("/mood-session")
    public MoodSessionResponse session(@Valid @RequestBody MoodSessionRequest r) {
        return service.session(r);
    }

    @GetMapping("/discover/moods")
    public List<MoodView> discover() {
        return service.all();
    }

    @PostMapping("/discover/query")
    public QueryResponse query(@Valid @RequestBody QueryRequest r) {
        String q = r.query().toLowerCase();
        String m = q.contains("peace") || q.contains("calm") ? "CALM"
                : q.contains("party") || q.contains("energy") ? "ENERGETIC"
                : q.contains("miss") || q.contains("memory") ? "NOSTALGIC"
                : q.contains("romantic") ? "ROMANTIC"
                : "HAPPY";
        return new QueryResponse(m, 0.82, service.recommendations(m));
    }
}
