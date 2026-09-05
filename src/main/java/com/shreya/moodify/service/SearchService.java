package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*; import org.springframework.stereotype.Service;
@Service public class SearchService { private final SongService songs; public SearchService(SongService s){songs=s;} public PageResponse<SongView> search(String q,int page,int size){return songs.search(q,page,size);} }
