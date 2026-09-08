package com.shreya.moodify.service;

import com.shreya.moodify.dto.ApiDtos.SongView;

import java.util.List;

public record SpotifyMusicPage(List<SongView> songs, boolean hasMore) {}
