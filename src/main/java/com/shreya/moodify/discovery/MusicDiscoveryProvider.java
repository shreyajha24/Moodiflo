package com.shreya.moodify.discovery;

import java.util.List;

public interface MusicDiscoveryProvider {
    String name();
    List<MusicCandidate> discover(DiscoveryRequest request);
}
