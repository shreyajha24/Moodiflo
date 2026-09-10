package com.shreya.moodify.controller;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.FeatureService;
import com.shreya.moodify.service.HomeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FeatureController {

    private final FeatureService service;
    private final HomeService homeService;

    public FeatureController(FeatureService s, HomeService h) {
        this.service = s;
        this.homeService = h;
    }

    @PostMapping("/listening-history")
    @ResponseStatus(HttpStatus.CREATED)
    public void recordHistory(Authentication a, @Valid @RequestBody HistoryRequest r) {
        service.record(a.getName(), r);
    }

    @GetMapping("/listening-history")
    public List<SongView> listeningHistory(Authentication a) {
        return service.recent(a.getName());
    }

    @GetMapping("/songs/{songId}/lyrics")
    public List<String> lyrics(@PathVariable Long songId) {
        return service.rawLyrics(songId);
    }

    @GetMapping("/songs/{songId}/translations")
    public List<TranslationView> translations(@PathVariable Long songId) {
        return service.translationList(songId);
    }

    @PostMapping("/songs/{songId}/translate")
    public TranslationView translate(Authentication a, @PathVariable Long songId, @Valid @RequestBody TranslationRequest r) {
        return service.translate(a.getName(), songId, r);
    }

    @PostMapping("/translation")
    public TextTranslationView translateText(Authentication a, @Valid @RequestBody TextTranslationRequest request) {
        if (a == null) throw new org.springframework.security.access.AccessDeniedException("Sign in to use translation.");
        return service.translateText(request);
    }

    @GetMapping("/lyrics")
    public LyricsLookupView externalLyrics(@RequestParam String title, @RequestParam String artist) {
        return service.lookupExternalLyrics(title, artist);
    }

    @GetMapping("/home")
    public DiscoveryResponse home(Authentication a) {
        String email = a != null ? a.getName() : null;
        return homeService.home(email);
    }
}
