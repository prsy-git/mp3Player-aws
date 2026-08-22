//type for a song or track
export interface Song {
    id: string;
    title: string;
    duration: number;
}

//defines state for music player component
export interface Player {
    currentPlaying: Song | null;
    isPlaying: boolean;
    volume: number;
}