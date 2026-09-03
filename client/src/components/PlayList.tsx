import { Playlist as PlaylistType, Song} from '../types'

interface PlaylistProps {
    playlist: PlaylistType;
    currentSong: Song | null;
    onSelectSong: (song: Song, index: number) => void;
    onDeleteSong?: (songId: string) => void;
}

export default function PlayList({playlist, currentSong, onSelectSong, onDeleteSong}: PlaylistProps) {

    return (
        <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>{playlist.name}</h2>

            {playlist.songs.length === 0 && <p>No songs in this playlist.</p>}

            {playlist.songs.length > 0 && (
                <ul style={{ width: '100%', padding: 0, listStyle: 'none' }}>
                    {playlist.songs.map((song, index) => {
                        const isSelected = currentSong?.id === song.id;

                        return (
                            <li
                                key={song.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '8px 12px',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    boxSizing: 'border-box',
                                    fontWeight: isSelected ? 'bold' : 'normal',
                                    backgroundColor: isSelected ? '#eef6ff' : 'transparent',
                                    borderRadius: '4px',
                                    marginBottom: '4px',
                                }}
                                onClick={() => onSelectSong(song, index)}
                            >
                                <span
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                    title={`${index + 1}. {song.title}`}
                                >
                                    {index + 1}. {song.title}
                                </span>

                                {onDeleteSong && (
                                    <button
                                        type="button"
                                        style={{ flexShrink: 0 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSong(song.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}