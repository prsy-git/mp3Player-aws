//type for a song or track
export interface Song {
    id: string;
    title: string;
    duration: number;
    filePath: string;
}

//Playlist interface / data structure
export interface Playlist {
    id: string;
    name: string;
    isDefault?: boolean;
    songs: Song[];
}

//defines state for music player component
export interface AudioPlayerProps {
    currentSong: Song | null;
    loopFlag: boolean;
    onToggleLoop: () => void;
    onEnded?: () => void;
    isAutoplaying?: boolean;
    onToggleAutoplay?: () => void;
    isShuffled?: boolean;
    onToggleShuffle?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
}

//prop compile for sidebar component
export interface SidebarProps {
    playlists: Playlist[];
    selectedPlaylistId: string;
    onSelectPlaylist: (playlistId: string) => void;
    onCreatePlaylist: (name: string) => void;
    onDeletePlaylist: (id: string) => void;
}