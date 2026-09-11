import { Playlist as PlaylistType, Song} from '../types'

interface PlaylistProps {
    playlist: PlaylistType;
    playlists: PlaylistType[];
    currentSong: Song | null;
    onSelectSong: (song: Song, index: number) => void;
    onDeleteSong?: (songId: string) => void;
    onAddSongToPlaylist: (targetPlaylistId: string, song: Song) => void;
    onRemoveFromPlaylist?: (songId: string) => void;
}

export default function PlayList({
    playlist, 
    playlists, 
    currentSong, 
    onSelectSong, 
    onDeleteSong, 
    onAddSongToPlaylist,
    onRemoveFromPlaylist
}: PlaylistProps) {
    return (
        <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Current Playlist: {playlist.name}</h2>

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
                                    title={`${index + 1}. ${song.title}`}
                                >
                                    {index + 1}. {song.title}
                                </span>

                                {/* Action buttons for individual lineitems */}
                                <div
                                    style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0}}
                                    onClick={(e) => e.stopPropagation()} // does not count as a click event on the line item
                                >
                                    {/*Add to a playlist dropdown*/}
                                    <select
                                        defaultValue=""
                                        style={{ padding: '2px 6px', fontSize: '12px' }}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                onAddSongToPlaylist(e.target.value, song);
                                                e.target.value = "";
                                            }
                                        }}
                                    >
                                        <option value="" disabled>+ Add to...</option>
                                        {playlists
                                            .filter((pl) => pl.id !== playlist.id)
                                            .map((pl) => (
                                                <option key={pl.id} value={pl.id}>
                                                    {pl.name}
                                                </option>
                                            ))}
                                    </select>

                                    {/*Delete handling button for individual li from server, on 'library'*/}
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

                                    {/*Delete from playlist handling to display for all other playlist arrays*/}
                                    {onRemoveFromPlaylist && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onRemoveFromPlaylist(song.id)
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}