package com.shreya.moodify.controller;

import com.shreya.moodify.dto.ApiDtos.SargamPlaceView;
import com.shreya.moodify.service.SargamService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sargam")
public class SargamController {
    private final SargamService service;

    public SargamController(SargamService service) {
        this.service = service;
    }

    @GetMapping("/explore")
    public SargamPlaceView explore(@RequestParam String place, Authentication authentication) {
        return service.explore(place, authentication == null ? null : authentication.getName());
    }

    @GetMapping("/reverse")
    public SargamPlaceView reverse(@RequestParam double latitude,
                                   @RequestParam double longitude,
                                   Authentication authentication) {
        return service.reverse(latitude, longitude, authentication == null ? null : authentication.getName());
    }
}
