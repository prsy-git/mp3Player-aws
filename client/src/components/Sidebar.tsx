import { SidebarProps } from '../types';
import {useState, useEffect} from 'react';

//Function: To display playlists on a sidebar of the webpage
//Minimum Ver: Display playlists (from app array in sidebar)

export default function Sidebar({ playlists, selectedPlaylistId, onSelectPlaylist, onCreatePlaylist, onDeletePlaylist }: SidebarProps) {
    //Control state to display add button versus inline form if clicked, and typed name
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [newPlaylistName, setNewPlaylistName] = useState<string>('');

    //Submit handler
    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();

        if (newPlaylistName.trim()) {
            onCreatePlaylist(newPlaylistName.trim());
            setNewPlaylistName('');
            setIsAdding(false);
        }
    };
    
    return (
        <aside>
            <h3>Playlists</h3>
            
            {/* Form button */}
            {isAdding ? (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Playlist name..."
                        autoFocus
                    />
                    <button type="submit">Add</button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdding(false);
                            setNewPlaylistName('');
                        }}
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <button type="button" onClick={() => setIsAdding(true)}>
                    + New Playlist
                </button>
            )}
            
            <ul>
                {playlists.map((playlist) => (
                    <li 
                        key={playlist.id}
                        onClick={() => onSelectPlaylist(playlist.id)}
                    >
                        <span>{playlist.name}</span>

                        {/* Delete button should not display for 'library' id playlist */}
                        {playlist.id !== 'library' && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePlaylist(playlist.id);
                                }}
                            >
                                x
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
