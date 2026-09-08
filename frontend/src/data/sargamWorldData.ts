export interface SargamRegion {
  id: string;
  name: string;
  country: string;
  continent: string;
  coordinates: [number, number]; // [longitude, latitude]
  sceneTitle: string;
  soundDescription: string;
  culturalStory: string;
  primaryGenres: string[];
  keyArtists: string[];
  sampleTracks: {
    title: string;
    artist: string;
    genre: string;
    duration: number;
    audioUrl?: string;
  }[];
  connectedRegionId: string;
  travelBridgeText: string;
  moodAffinity: string;
}

export const sargamWorldData: SargamRegion[] = [
  {
    id: 'delhi',
    name: 'Delhi & Punjab',
    country: 'India',
    continent: 'South Asia',
    coordinates: [77.209, 28.6139],
    sceneTitle: 'Contemporary Indie & Sufi Fusion',
    soundDescription: 'Acoustic sarangi, introspective Hindi-Urdu poetry, and sub-bass syncopation meeting indie songwriting.',
    culturalStory: 'From the nocturnal tea stalls of Old Delhi to indie bedroom studios in Hauz Khas, classical ragas dissolve into ambient dreamscapes.',
    primaryGenres: ['Indie Folk', 'Sufi Contemporary', 'Acoustic Raga'],
    keyArtists: ['Prateek Kuhad', 'Ali Sethi', 'When Chai Met Toast', 'The Local Train'],
    sampleTracks: [
      { title: 'Raat Ki Subah', artist: 'Dilli Dhun Project', genre: 'Indie Folk', duration: 214 },
      { title: 'Bulleya Reverie', artist: 'Hauz Khas Trio', genre: 'Sufi Fusion', duration: 248 },
    ],
    connectedRegionId: 'lahore',
    travelBridgeText: 'Crosses the Radcliffe line into Lahore through shared classical scales, Punjabi poetry, and electric harmonium.',
    moodAffinity: 'NOSTALGIC',
  },
  {
    id: 'lahore',
    name: 'Lahore & Karachi',
    country: 'Pakistan',
    continent: 'South Asia',
    coordinates: [74.3587, 31.5204],
    sceneTitle: 'Alternative Qawwali & Psychedelic Rock',
    soundDescription: 'Hypnotic clapping rhythms, overdriven guitars, and transcendent multi-octave vocal improvisations.',
    culturalStory: 'Centuries of mystical shrine music collided with garage rock in Lahore and Karachi, yielding Coke Studio and South Asia’s most daring indie renaissance.',
    primaryGenres: ['Alternative Qawwali', 'Pakistani Indie', 'Psychedelic Rock'],
    keyArtists: ['Jaubi', 'Arooj Aftab', 'Strings', 'Kaavish'],
    sampleTracks: [
      { title: 'Mohabbat Echoes', artist: 'Ravi Sound Collective', genre: 'Alternative Qawwali', duration: 275 },
      { title: 'Karachi Midnight', artist: 'Seaview Ensemble', genre: 'Indie Rock', duration: 198 },
    ],
    connectedRegionId: 'beirut',
    travelBridgeText: 'Connects west across the Arabian Sea into Beirut through shared modal maqam systems and melancholic microtones.',
    moodAffinity: 'DREAMY',
  },
  {
    id: 'beirut',
    name: 'Beirut & Levant',
    country: 'Lebanon',
    continent: 'Middle East',
    coordinates: [35.5018, 33.8938],
    sceneTitle: 'Levantine Indie & Electro-Acoustic',
    soundDescription: 'Oud melodies woven into modular synthesizers, poetic Arabic lyricism, and downtempo electronic beats.',
    culturalStory: 'Amidst the resilience of the Mediterranean coast, artists in Beirut blend classic Arabic singing traditions with experimental underground nightlife.',
    primaryGenres: ['Arabic Indie', 'Electro-Tarab', 'Downtempo Oud'],
    keyArtists: ['Mashrou\' Leila', 'Yasmine Hamdan', 'Soapkills', 'Postcards'],
    sampleTracks: [
      { title: 'Hamra Stroll', artist: 'Beirut Nights', genre: 'Arabic Indie', duration: 230 },
      { title: 'Min Ghayr Hodood', artist: 'Levant Wave', genre: 'Electro-Tarab', duration: 260 },
    ],
    connectedRegionId: 'lisbon',
    travelBridgeText: 'Sails across the Mediterranean to Lisbon, where Levantine vocal ornamentation mirrors the nostalgic longing of Portuguese Fado.',
    moodAffinity: 'MELANCHOLIC',
  },
  {
    id: 'lisbon',
    name: 'Lisbon & Porto',
    country: 'Portugal',
    continent: 'Europe',
    coordinates: [-9.1393, 38.7223],
    sceneTitle: 'New Fado & Lusophone Grooves',
    soundDescription: 'Twelve-string Portuguese guitar paired with modern sub-frequencies, Cape Verdean coladeira, and intimate vocal restraint.',
    culturalStory: 'Lisbon sits at a global sonic crossroads: maritime longing (saudade) harmonizes with Afro-Portuguese bass and acoustic indie poetry.',
    primaryGenres: ['New Fado', 'Saudade Indie', 'Kuduro Ambient'],
    keyArtists: ['Carminho', 'Dino d\'Santiago', 'Ana Moura', 'Mayra Andrade'],
    sampleTracks: [
      { title: 'Alfama Breeze', artist: 'Lisboa Acústica', genre: 'New Fado', duration: 210 },
      { title: 'Saudade Urbana', artist: 'Tejo Sound', genre: 'Lusophone Indie', duration: 245 },
    ],
    connectedRegionId: 'saopaulo',
    travelBridgeText: 'Crosses the Atlantic into São Paulo, carrying the Portuguese language into Brazil’s rich syncopated Samba and MPB.',
    moodAffinity: 'CALM',
  },
  {
    id: 'saopaulo',
    name: 'São Paulo & Bahia',
    country: 'Brazil',
    continent: 'South America',
    coordinates: [-46.6333, -23.5505],
    sceneTitle: 'MPB, Tropicália & Afro-Samba',
    soundDescription: 'Warm nylon-string guitars, sophisticated syncopation, cuíca undertones, and poetic Portuguese melodies.',
    culturalStory: 'The sprawling concrete jungle of São Paulo and the coastal pulse of Salvador da Bahia unite Afro-diasporic polyrhythms with bossa nova elegance.',
    primaryGenres: ['MPB', 'Bossa Indie', 'Afro-Brazilian Fusion'],
    keyArtists: ['Seu Jorge', 'Liniker', 'Tim Bernardes', 'Luedji Luna'],
    sampleTracks: [
      { title: 'Luz da Cidade', artist: 'Paulista Duo', genre: 'MPB', duration: 220 },
      { title: 'Bahia Balanço', artist: 'Ondas do Mar', genre: 'Afro-Samba', duration: 255 },
    ],
    connectedRegionId: 'lagos',
    travelBridgeText: 'Follows historic Atlantic trade routes to Lagos, tracing Afro-Brazilian polyrhythms back to Yoruba talking drums and Highlife.',
    moodAffinity: 'HOPEFUL',
  },
  {
    id: 'lagos',
    name: 'Lagos & Accra',
    country: 'Nigeria & Ghana',
    continent: 'West Africa',
    coordinates: [3.3792, 6.5244],
    sceneTitle: 'Afrobeats, Highlife & Alté',
    soundDescription: 'Infectious logarithmic percussion, saxophone brass flourishes, and relaxed vocal cadences.',
    culturalStory: 'From Fela Kuti’s Shrine to Mainland Lagos studio lofts, West Africa is the rhythmic heart of the modern world, inspiring global pop and soul.',
    primaryGenres: ['Afrobeats', 'Highlife', 'Alté'],
    keyArtists: ['Burna Boy', 'Tems', 'Wizkid', 'Odunsi (The Engine)'],
    sampleTracks: [
      { title: 'Victoria Island Vibe', artist: 'Lagos Groove System', genre: 'Afrobeats', duration: 195 },
      { title: 'Midnight Palm', artist: 'Accra Soundscape', genre: 'Highlife', duration: 235 },
    ],
    connectedRegionId: 'kingston',
    travelBridgeText: 'Crosses the Caribbean Sea into Kingston, where West African call-and-response laid the roots of Rocksteady and Dub.',
    moodAffinity: 'ENERGETIC',
  },
  {
    id: 'kingston',
    name: 'Kingston & Port-au-Prince',
    country: 'Jamaica',
    continent: 'Caribbean',
    coordinates: [-76.7936, 17.9712],
    sceneTitle: 'Roots Dub, Reggae & Island Ambient',
    soundDescription: 'Spacious reverb delays, heavy basslines, organic one-drop rim-shots, and socially conscious lyrics.',
    culturalStory: 'In the sound-system yards of Kingston, music became spiritual rebellion and spatial engineering through the invention of modern Dub mixing.',
    primaryGenres: ['Dub', 'Roots Reggae', 'Island Downtempo'],
    keyArtists: ['Chronixx', 'Koffee', 'King Tubby', 'Protoje'],
    sampleTracks: [
      { title: 'Echoes of Blue Mountain', artist: 'Kingston Echo', genre: 'Roots Dub', duration: 260 },
      { title: 'Trenchtown Sunset', artist: 'Harbor Sound', genre: 'Reggae', duration: 215 },
    ],
    connectedRegionId: 'neworleans',
    travelBridgeText: 'Moves north into New Orleans, where Caribbean habanera rhythms formed the bedrock of American jazz and blues.',
    moodAffinity: 'CALM',
  },
  {
    id: 'neworleans',
    name: 'New Orleans & Delta',
    country: 'United States',
    continent: 'North America',
    coordinates: [-90.0715, 29.9511],
    sceneTitle: 'Crescent City Brass & Deep Blues',
    soundDescription: 'Syncopated second-line drumming, soulful horn harmonies, and slide-guitar story-weaving.',
    culturalStory: 'Where the Mississippi River meets the sea, African, French, and Spanish traditions converged in Congo Square to invent American popular music.',
    primaryGenres: ['Delta Blues', 'Second Line Jazz', 'Soulful Folk'],
    keyArtists: ['Jon Batiste', 'Preservation Hall', 'Trombone Shorty', 'Hurray for the Riff Raff'],
    sampleTracks: [
      { title: 'Frenchmen Street Glow', artist: 'Crescent City Quintet', genre: 'New Orleans Jazz', duration: 240 },
      { title: 'Bayou Drift', artist: 'Mississippi Acoustic', genre: 'Delta Blues', duration: 210 },
    ],
    connectedRegionId: 'bristol',
    travelBridgeText: 'Travels across the Atlantic to Bristol, where American blues and Jamaican sound-system culture fused into Trip-Hop.',
    moodAffinity: 'FOCUS',
  },
  {
    id: 'bristol',
    name: 'Bristol & London',
    country: 'United Kingdom',
    continent: 'Europe',
    coordinates: [-2.5879, 51.4545],
    sceneTitle: 'Atmospheric Trip-Hop & Contemporary Jazz',
    soundDescription: 'Heavy cinematic sub-bass, vinyl crackle, brooding female vocals, and smoky breakbeats.',
    culturalStory: 'The damp docks of Bristol generated the unmistakable Bristol Sound: Massive Attack and Portishead turning melancholy into timeless spatial art.',
    primaryGenres: ['Trip-Hop', 'UK Jazz', 'Downtempo Ambient'],
    keyArtists: ['Massive Attack', 'Portishead', 'Ezra Collective', 'Floating Points'],
    sampleTracks: [
      { title: 'Avon Fog', artist: 'St. Pauls Sound Unit', genre: 'Trip-Hop', duration: 280 },
      { title: 'Late Camden Session', artist: 'Soho Blue Trio', genre: 'UK Jazz', duration: 235 },
    ],
    connectedRegionId: 'tokyo',
    travelBridgeText: 'Reaches Tokyo, where Western jazz harmony and ambient production deeply influenced Japanese City Pop and environmental music.',
    moodAffinity: 'LATE NIGHT',
  },
  {
    id: 'tokyo',
    name: 'Tokyo & Kyoto',
    country: 'Japan',
    continent: 'East Asia',
    coordinates: [139.6917, 35.6895],
    sceneTitle: 'City Pop, Neo-Shibuya & Ambient Folk',
    soundDescription: 'Immaculate analog production, sparkling Fender Rhodes, pentatonic koto motifs, and breezy melancholia.',
    culturalStory: 'Japan’s late 20th-century urban prosperity birthed City Pop, while Kyoto’s tranquil temple gardens inspired ambient pioneer Hiroshi Yoshimura.',
    primaryGenres: ['City Pop', 'Japanese Ambient', 'Neo-Acoustic'],
    keyArtists: ['Tatsuro Yamashita', 'Taeko Onuki', 'Ichiko Aoba', 'Haruomi Hosono'],
    sampleTracks: [
      { title: 'Shinjuku Neon Drift', artist: 'Midnight Metropolis', genre: 'City Pop', duration: 228 },
      { title: 'Bamboo Courtyard', artist: 'Kyoto Sound Archive', genre: 'Japanese Ambient', duration: 265 },
    ],
    connectedRegionId: 'jakarta',
    travelBridgeText: 'Moves southward along the Pacific Rim into Jakarta, sharing sweet vintage melodies with Indonesian indie pop.',
    moodAffinity: 'DREAMY',
  },
  {
    id: 'jakarta',
    name: 'Jakarta & Bandung',
    country: 'Indonesia',
    continent: 'Southeast Asia',
    coordinates: [106.8456, -6.2088],
    sceneTitle: 'Indonesian Indie Pop & Gamelan Psych',
    soundDescription: 'Jangle guitar dreaminess, slendro gamelan scales, and sweet nostalgic lyricism in Bahasa and English.',
    culturalStory: 'Indonesia’s young independent music community in Jakarta and Bandung has produced Southeast Asia’s most creative bedroom-pop movement.',
    primaryGenres: ['Indie Pop', 'Gamelan Psych', 'Dream Pop'],
    keyArtists: ['White Shoes & The Couples Company', 'Mocca', 'Efek Rumah Kaca', 'Grrrl Gang'],
    sampleTracks: [
      { title: 'Senja Di Batavia', artist: 'Bandung Sunday Club', genre: 'Indonesian Indie', duration: 215 },
      { title: 'Pagi Hari', artist: 'Nusantara Dream', genre: 'Dream Pop', duration: 240 },
    ],
    connectedRegionId: 'delhi',
    travelBridgeText: 'Loops back across the Indian Ocean to Delhi, tracing ancient maritime routes that carried musical ragas to Southeast Asia.',
    moodAffinity: 'CALM',
  },
];
