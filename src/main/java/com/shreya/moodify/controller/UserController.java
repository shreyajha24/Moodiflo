package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.FeatureService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final FeatureService service;

    public UserController(FeatureService x) {
        this.service = x;
    }

    @GetMapping
    public UserView me(Authentication a) {
        return service.meView(a.getName());
    }

    @PostMapping("/favorites/{songId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void addFavorite(Authentication a, @PathVariable Long songId) {
        service.favorite(a.getName(), songId);
    }

    @DeleteMapping("/favorites/{songId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(Authentication a, @PathVariable Long songId) {
        service.unfavorite(a.getName(), songId);
    }

    @GetMapping("/favorites")
    public List<SongView> favorites(Authentication a) {
        return service.favorites(a.getName());
    }
}
