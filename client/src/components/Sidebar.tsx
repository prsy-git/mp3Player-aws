import { SidebarProps } from '../types';
import {useState, useEffect} from 'react';

//Function: To display playlists on a sidebar of the webpage
//Minimum Ver: Display playlists (from app array in sidebar)

export default function Sidebar({ playlists, selectedPlaylistId, onSelectPlaylist }: SidebarProps) {
    return (
        <aside>
            <h3>Playlists</h3>
            <ul>
                {playlists.map((playlist) => (
                    <li 
                        key={playlist.id}
                        onClick={() => onSelectPlaylist(playlist.id)}
                    >
                        {playlist.name}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
