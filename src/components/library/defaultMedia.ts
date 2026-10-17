import { MediaItem } from "../../types/player";

// Pre-generated waveform values for audio previews (40 data points normalized 0.15 - 1.0)
export const SAMPLE_WAVEFORMS: Record<string, number[]> = {
  chill: [
    0.2, 0.35, 0.5, 0.4, 0.65, 0.8, 0.7, 0.55, 0.45, 0.7, 0.85, 0.9, 0.75, 0.6,
    0.5, 0.65, 0.8, 0.95, 0.85, 0.7, 0.5, 0.4, 0.6, 0.75, 0.85, 0.7, 0.6, 0.45,
    0.55, 0.75, 0.9, 0.8, 0.65, 0.5, 0.4, 0.3, 0.45, 0.6, 0.4, 0.25,
  ],
  synth: [
    0.3, 0.6, 0.85, 0.9, 0.65, 0.4, 0.75, 0.95, 1.0, 0.8, 0.55, 0.35, 0.7,
    0.9, 0.85, 0.6, 0.45, 0.75, 0.95, 0.85, 0.5, 0.7, 0.9, 0.95, 0.75, 0.5,
    0.3, 0.65, 0.85, 0.9, 0.7, 0.55, 0.4, 0.65, 0.8, 0.95, 0.7, 0.45, 0.3, 0.2,
  ],
  ambient: [
    0.15, 0.2, 0.3, 0.35, 0.45, 0.55, 0.6, 0.5, 0.4, 0.35, 0.45, 0.6, 0.7, 0.65,
    0.5, 0.4, 0.35, 0.4, 0.5, 0.65, 0.75, 0.7, 0.6, 0.5, 0.45, 0.4, 0.5, 0.6,
    0.65, 0.55, 0.45, 0.35, 0.3, 0.25, 0.3, 0.4, 0.45, 0.35, 0.25, 0.15,
  ],
};

export const INITIAL_VIDEOS: MediaItem[] = [
  {
    id: "demo-sample",
    title: "VLC Reborn - Demo Stream",
    src: "/demo-sample.mp4",
    duration: 60,
    artist: "Juxtopposed Concept",
    type: "video",
    resolution: "1080p FHD",
    codec: "H.264 / AAC",
    category: "Featured",
    thumbnail:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    chapters: [
      {
        id: "demo-ch-1",
        title: "Introduction & Redesign Reveal",
        startTime: 0,
        endTime: 16,
        description: "Juxtopposed intro and VLC 25th anniversary reflection",
        thumbnail:
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "demo-ch-2",
        title: "Tauri Architecture & Canvas HUD",
        startTime: 16,
        endTime: 34,
        description: "Edge-to-edge hardware accelerated canvas and thick seekbar",
        thumbnail:
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "demo-ch-3",
        title: "Visual Subtitle Matcher Engine",
        startTime: 34,
        endTime: 48,
        description: "Real-time speech rhythm alignment & delay scrubbing",
        thumbnail:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "demo-ch-4",
        title: "Compact Library & Queue Flow",
        startTime: 48,
        endTime: 60,
        description: "Non-disruptive left library drawer & playlist queue",
        thumbnail:
          "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "big-buck-bunny",
    title: "Big Buck Bunny (Blender Open Movie)",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: 596,
    artist: "Blender Foundation",
    type: "video",
    resolution: "1080p 60fps",
    codec: "H.264 High",
    category: "Movies",
    thumbnail:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    chapters: [
      {
        id: "bbb-ch-1",
        title: "Morning in the Forest",
        startTime: 0,
        endTime: 135,
        description: "Bunny wakes up and discovers the beautiful forest morning",
        thumbnail:
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "bbb-ch-2",
        title: "The Mischievous Trio",
        startTime: 135,
        endTime: 320,
        description: "Frank, Rinky, and Gamera disturb the peaceful forest",
        thumbnail:
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "bbb-ch-3",
        title: "Bunny's Ingenious Traps",
        startTime: 320,
        endTime: 480,
        description: "Bunny designs elaborate mechanisms to outwit the trio",
        thumbnail:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "bbb-ch-4",
        title: "Victory & Butterfly Finale",
        startTime: 480,
        endTime: 596,
        description: "Triumph in the clearing and peaceful resolution",
        thumbnail:
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "tears-of-steel",
    title: "Tears of Steel (Sci-Fi Short)",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: 734,
    artist: "Ian Hubert & Blender Studio",
    type: "video",
    resolution: "4K UHD",
    codec: "H.264 / AC3",
    category: "Sci-Fi",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "elephants-dream",
    title: "Elephants Dream (Open Movie)",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: 653,
    artist: "Orange Open Movie Project",
    type: "video",
    resolution: "1080p",
    codec: "H.264 / AAC",
    category: "Animation",
    thumbnail:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "sintel",
    title: "Sintel - The Dragon's Call",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    duration: 888,
    artist: "Colin Levy & Durian Team",
    type: "video",
    resolution: "1080p Cinema",
    codec: "H.264",
    category: "Fantasy",
    thumbnail:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  },
];

export const INITIAL_MUSIC: MediaItem[] = [
  {
    id: "music-1",
    title: "Midnight Drive (Retro Synth)",
    artist: "Neon Waves",
    album: "Cyber Horizon 2099",
    src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3",
    duration: 184,
    type: "music",
    codec: "FLAC 24-bit 96kHz",
    category: "Synthwave",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    waveform: SAMPLE_WAVEFORMS.synth,
  },
  {
    id: "music-2",
    title: "Coffee & Rain in Kyoto",
    artist: "Lofi Beats Collective",
    album: "Rainy Afternoon Vol. 4",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    duration: 142,
    type: "music",
    codec: "MP3 320kbps",
    category: "Lo-Fi Chill",
    thumbnail:
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
    waveform: SAMPLE_WAVEFORMS.chill,
  },
  {
    id: "music-3",
    title: "Starlight Deep Space Drone",
    artist: "Solaris Ensemble",
    album: "Interstellar Resonances",
    src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    duration: 215,
    type: "music",
    codec: "ALAC Lossless",
    category: "Ambient",
    thumbnail:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    waveform: SAMPLE_WAVEFORMS.ambient,
  },
];

export const INITIAL_STREAMS: MediaItem[] = [
  {
    id: "stream-nasa",
    title: "NASA TV Public HD Stream",
    artist: "NASA Aerospace",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    type: "stream",
    resolution: "1080p Live",
    codec: "HLS / H.264",
    category: "Live Television",
    thumbnail:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "stream-somafm",
    title: "SomaFM - Groove Salad (Downtempo)",
    artist: "SomaFM Radio San Francisco",
    src: "https://ice1.somafm.com/groovesalad-128-mp3",
    type: "stream",
    codec: "128k MP3 Stream",
    category: "Internet Radio",
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    waveform: SAMPLE_WAVEFORMS.chill,
  },
  {
    id: "stream-mux-test",
    title: "Mux HLS Adaptive Test Stream",
    artist: "Mux Video Engineering",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    type: "stream",
    resolution: "Multi-bitrate HLS",
    codec: "H.264 / AAC",
    category: "HLS Streams",
    thumbnail:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
  },
];
