package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.discovery.DiscoveryService;
import com.shreya.moodify.entity.Mood;
import com.shreya.moodify.exception.ApiExceptions.BadRequest;
import com.shreya.moodify.exception.ApiExceptions.NotFound;
import com.shreya.moodify.repository.MoodRepository;
import com.shreya.moodify.repository.SongMoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class MoodService {

    private final MoodRepository moods;
    private final SongMoodRepository links;
    private final SpotifyService spotifyService;
    private final DiscoveryService discoveryService;

    public MoodService(MoodRepository m, SongMoodRepository l, SpotifyService spotifyService, DiscoveryService discoveryService) {
        this.moods = m;
        this.links = l;
        this.spotifyService = spotifyService;
        this.discoveryService = discoveryService;
    }

    @Transactional(readOnly = true)
    public Mood get(String name) {
        return moods.findByNameIgnoreCase(name)
                .orElseThrow(() -> new NotFound("Mood not found"));
    }

    public MoodView view(Mood m) {
        List<String> genres = m.getRecommendedGenres() == null ? List.of()
                : Arrays.stream(m.getRecommendedGenres().split(",")).map(String::trim).toList();
        return new MoodView(m.getId(), m.getName(), m.getDescription(), m.getEmoji(), m.getIntensity(), genres);
    }

    @Transactional(readOnly = true)
    public List<MoodView> all() {
        return moods.findAll().stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public List<SongView> recommendations(String name) {
        return recommendations(name, null);
    }

    @Transactional(readOnly = true)
    public List<SongView> recommendations(String name, String userEmail) {
        return recommendationsPage(name, userEmail, 0, 20).songs();
    }

    @Transactional(readOnly = true)
    public SpotifyMusicPage recommendationsPage(String name, String userEmail, int page, int limit) {
        get(name);
        List<SongView> spotifyTracks = page == 0 ? discoveryService.discoverMood(name, userEmail, limit) : List.of();
        if (spotifyTracks.isEmpty()) {
            spotifyTracks = spotifyService.searchByMood(name, userEmail, page * limit, limit);
        }
        return new SpotifyMusicPage(spotifyTracks, spotifyTracks.size() == limit);
    }

    @Transactional(readOnly = true)
    public MoodSessionResponse session(MoodSessionRequest r) {
        String moodName = get(r.mood()).getName();
        List<SongView> songs = recommendationsPage(r.mood(), null, 0, 20).songs();
        String playlistName = (r.language() != null && !r.language().isBlank() ? r.language() + " " : "")
                + moodName.substring(0, 1).toUpperCase() + moodName.substring(1).toLowerCase() + " Session";
        return new MoodSessionResponse(UUID.randomUUID().toString(), moodName, playlistName, songs);
    }

    public MoodView create(MoodRequest r) {
        if (moods.findByNameIgnoreCase(r.name()).isPresent()) {
            throw new BadRequest("Mood already exists");
        }
        return view(moods.save(apply(new Mood(), r)));
    }

    public MoodView update(Long id, MoodRequest r) {
        Mood m = moods.findById(id).orElseThrow(() -> new NotFound("Mood not found"));
        return view(moods.save(apply(m, r)));
    }

    public void delete(Long id) {
        Mood m = moods.findById(id).orElseThrow(() -> new NotFound("Mood not found"));
        if (!links.findByMoodOrderByMoodScoreDesc(m).isEmpty()) {
            throw new BadRequest("Mood is in use");
        }
        moods.delete(m);
    }

    private Mood apply(Mood m, MoodRequest r) {
        m.setName(r.name().toUpperCase());
        m.setDescription(r.description());
        m.setEmoji(r.emoji());
        m.setIntensity(r.intensity() == null ? 1.0 : r.intensity());
        m.setRecommendedGenres(r.recommendedGenres());
        return m;
    }
}
