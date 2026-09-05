package com.shreya.moodify.controller;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.SearchService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@Validated
public class SearchController {

    private final SearchService service;

    public SearchController(SearchService s) {
        this.service = s;
    }

    @GetMapping
    public PageResponse<SongView> search(
            @RequestParam(value = "q", defaultValue = "") String q,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.search(q, page, size);
    }
}
