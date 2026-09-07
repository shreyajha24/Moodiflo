package com.shreya.moodify.service;

import com.shreya.moodify.dto.ApiDtos.SongView;

import java.util.List;

public interface MusicProvider {
    MusicPage getTracksForMood(String mood, int page, int limit);

    record MusicPage(List<SongView> songs, boolean hasMore) {}
}
