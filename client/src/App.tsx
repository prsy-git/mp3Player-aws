import './index.css';
import {Song, Playlist} from './types';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import AudioPlayer from './components/AudioPlayer';
import PlayList from './components/PlayList';
import Sidebar from './components/Sidebar';

export default function App() {
    
    //states to manage that are relevant for multiple components / across the app
    const [currentSong, setCurrentSong] = useState<Song | null>(null)
    const [refreshFlag, setRefreshFlag] = useState<number>(0);
    const [loopFlag, setLoopFlag] = useState<boolean>(false);

    //Playlist array for eventual sidebar interaction
    const [playlists, setPlaylists] = useState<Playlist[]>([
        { id: 'library', name: 'All Uploads', songs: []},
        { id: 'favorites', name: 'Favorites', songs: []},
        { id: 'testlist', name: 'test3', songs: []}
    ]);

    //Track state of currently selected playlist id element (by default / on startup, library)
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('library');

    //Active playlist object dervied from id
    const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

    //Fetch current tracks on refreshFlag state change.
    useEffect(() => {
        fetch('http://localhost:5000/api/tracks')
            .then((res) => res.json())
            .then((data: { songs: string[] }) => {
                const inFormatSongs: Song[] = data.songs.map((songName) => ({
                    id: songName,
                    title: songName,
                    duration: 0,
                }));

                setPlaylists((prev) => 
                    prev.map((playlist) =>
                        playlist.id === 'library' ? {...playlist, songs: inFormatSongs } : playlist
                    )
                );
            })

            .catch((err) => console.error('Could not load library tracks:', err))
    }, [refreshFlag]);

    //Backend delete for playlist items
    const handleDeleteSong = async (songId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tracks/${encodeURIComponent(songId)}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setPlaylists((prev) => 
                    prev.map((playlist) => 
                        playlist.id === 'library' ? {...playlist, songs: playlist.songs.filter((song) => song.id !== songId)} : playlist
                    )
                );
            }

            else {
                console.error('Failed to delete track from backend server.');
            }
        }

        catch(err) {
            console.error('Error deleting track', err);
        }
    };

    //Upload success increment handler for useEffect
    const handleUploadSuccess = () => {
        setRefreshFlag((prev) => prev + 1);
    };

    //Loop toggle handler
    const toggleLoop = () => {
        setLoopFlag((prev) => !prev);
    }

    return (
        
        <div style={{display: 'flex', gap: '24px', maxWidth: '1100px', margin: '40px auto', alignItems: 'flex-start'}}>
            
            {/*Test of display for basic Sidebar implementation*/}
            <Sidebar
                playlists={playlists}
                selectedPlaylistId={selectedPlaylistId}
                onSelectPlaylist={setSelectedPlaylistId}
            >
            </Sidebar>
            
            <main className="app-container">
            
                <Header/>

                <p>File upload form</p>
                <UploadForm onUploadSuccess={handleUploadSuccess} />

                <AudioPlayer
                    currentSong={currentSong}
                    loopFlag={loopFlag}
                    onToggleLoop={toggleLoop}
                >
                </AudioPlayer>

                <PlayList 
                    playlist={activePlaylist}
                    currentSong={currentSong}
                    onSelectSong={(song, index) => {
                        setCurrentSong(song);
                        setLoopFlag(false);
                    }}
                    onDeleteSong={handleDeleteSong}
                />  
            </main>
        </div>
    )
}