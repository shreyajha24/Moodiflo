package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.SongService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/songs")
@Validated
public class SongController {

    private final SongService service;

    public SongController(SongService s) {
        this.service = s;
    }

    @GetMapping
    public PageResponse<SongView> all(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.all(page, size);
    }

    @GetMapping("/{id}")
    public SongView one(@PathVariable Long id) {
        return service.view(service.get(id));
    }

    @GetMapping("/search")
    public PageResponse<SongView> search(
            @RequestParam(value = "query", defaultValue = "") String query,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.search(query, page, size);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public SongView create(@Valid @RequestBody SongRequest r) {
        return service.view(service.save(r));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SongView update(@PathVariable Long id, @Valid @RequestBody SongRequest r) {
        return service.view(service.update(id, r));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
