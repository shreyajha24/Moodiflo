package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.SongService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
            @RequestParam(value = "query", defaultValue = "") @Size(max = 100) String query,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.search(query, page, size);
    }
}
