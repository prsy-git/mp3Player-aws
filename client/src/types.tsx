//type for a song or track
export interface Song {
    id: string;
    title: string;
    duration: number;
}

//defines state for music player component
export interface AudioPlayerProps {
    currentSong: string | null;
    loopFlag: boolean;
    onToggleLoop: () => void;
}

//Playlist interface / data structure
export interface Playlist {
    id: string;
    name: string;
    isDefault?: boolean;
    songs: Song[];
}