package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.MoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public Map<String, Object> recommendations(@PathVariable String name) {
        return Map.of("mood", name.toUpperCase(), "songs", service.recommendations(name));
    }

    @PostMapping("/moods")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public MoodView create(@Valid @RequestBody MoodRequest r) {
        return service.create(r);
    }

    @PutMapping("/moods/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MoodView update(@PathVariable Long id, @Valid @RequestBody MoodRequest r) {
        return service.update(id, r);
    }

    @DeleteMapping("/moods/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
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
