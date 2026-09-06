package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.service.SpotifyService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/spotify")
public class SpotifyController {
    private final SpotifyService spotify;

    public SpotifyController(SpotifyService spotify) {
        this.spotify = spotify;
    }

    @GetMapping("/status")
    public SpotifyStatusView status(Authentication authentication) {
        return spotify.getStatus(authentication.getName());
    }

    @GetMapping("/authorize")
    public SpotifyAuthUrlView authorize(Authentication authentication) {
        return new SpotifyAuthUrlView(spotify.buildAuthUrl(authentication.getName()));
    }

    @GetMapping("/token")
    public SpotifyTokenView token(Authentication authentication) {
        return new SpotifyTokenView(spotify.getAccessToken(authentication.getName()));
    }

    @DeleteMapping("/connection")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disconnect(Authentication authentication) {
        spotify.disconnect(authentication.getName());
    }

    @GetMapping("/callback")
    public void callback(@RequestParam(required = false) String code,
                         @RequestParam(required = false) String state,
                         @RequestParam(required = false) String error,
                         jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        String destination = spotify.getFrontendUrl() + "/profile?spotify=";
        if (error != null || code == null || state == null) {
            response.sendRedirect(destination + "error");
            return;
        }
        try {
            spotify.exchangeCode(code, state);
            response.sendRedirect(destination + "connected");
        } catch (RuntimeException ex) {
            response.sendRedirect(destination + "error");
        }
    }
}
