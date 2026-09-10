package com.shreya.moodify.discovery;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlaceResolver {
    private final Map<String, NormalizedPlace> places = new HashMap<>();

    public PlaceResolver() {
        add(new NormalizedPlace("Punjab", "India", "Punjab", null, List.of("punjab", "panjab"), List.of("Punjabi", "Hindi"), List.of("Punjabi culture"), List.of("Punjabi", "Bhangra", "Punjabi Folk", "Punjabi Pop", "Punjabi Hip Hop", "Sufi", "Punjabi Traditional"), "region"));
        add(new NormalizedPlace("Delhi", "India", "Delhi", "Delhi", List.of("delhi", "new delhi"), List.of("Hindi", "Punjabi"), List.of("North Indian"), List.of("Hindi", "Punjabi", "Bollywood", "Sufi"), "city"));
        add(new NormalizedPlace("Mumbai", "India", "Maharashtra", "Mumbai", List.of("mumbai", "bombay"), List.of("Hindi", "Marathi"), List.of("Maharashtrian"), List.of("Hindi", "Marathi", "Bollywood", "Indie"), "city"));
        add(new NormalizedPlace("Kolkata", "India", "West Bengal", "Kolkata", List.of("kolkata", "calcutta"), List.of("Bengali", "Hindi"), List.of("Bengali"), List.of("Bengali", "Rabindra Sangeet", "Baul", "Indian Classical"), "city"));
        add(new NormalizedPlace("London", "United Kingdom", "England", "London", List.of("london"), List.of("English"), List.of("British"), List.of("British Pop", "London Indie", "Electronic", "Rock"), "city"));
        add(new NormalizedPlace("Kashmir", "India", "Jammu and Kashmir", null, List.of("kashmir", "jammu and kashmir"), List.of("Kashmiri", "Hindi", "Urdu"), List.of("Kashmiri"), List.of("Kashmiri Folk", "Sufi", "Indian Folk"), "region"));
        add(new NormalizedPlace("Rajasthan", "India", "Rajasthan", null, List.of("rajasthan"), List.of("Hindi", "Rajasthani"), List.of("Rajasthani"), List.of("Rajasthani Folk", "Indian Folk", "Sufi", "Desert Music"), "region"));
    }

    public NormalizedPlace resolve(String input) {
        String value = input == null ? "" : input.trim().toLowerCase(Locale.ROOT);
        return places.getOrDefault(value, new NormalizedPlace(input == null ? "" : input.trim(), null, null, null,
                List.of(value), List.of(), List.of(), List.of(input == null ? "" : input.trim() + " music"), "unknown"));
    }

    private void add(NormalizedPlace place) { place.aliases().forEach(alias -> places.put(alias.toLowerCase(Locale.ROOT), place)); }
}
