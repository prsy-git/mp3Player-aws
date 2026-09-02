import { Playlist as PlaylistType, Song} from '../types'

interface PlaylistProps {
    playlist: PlaylistType;
    currentSong: null;
    onSelectSong: (song: Song, index: number) => void;
}

export default function PlayList({playlist, currentSong, onSelectSong}: PlaylistProps) {

    return (
        <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>playlist.name</h2>
        </div>
    )
}