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
    ]);

    //Track state of currently selected playlist id element (by default / on startup, library)
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('library');

    //Active playlist object dervied from id
    const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

    //Fetch current tracks on refreshFlag state change to update 'library' bucket.
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

    //Backend delete for playlist items. NOTE: Traverses playlists to remove artifacts / pointers to deleted song
    const handleDeleteSong = async (songId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tracks/${encodeURIComponent(songId)}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setPlaylists((prev) => 
                    prev.map((playlist) => ({
                        ...playlist,
                        songs: playlist.songs.filter((song) => song.id !== songId),
                    }))
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

    //Add to playlist onClick handler
    const handleAddSongToPlaylist = (targetPlaylistId: string, addedSong: Song) => {
        setPlaylists((prevPlaylists) => 
            prevPlaylists.map((pl) => {
                if (pl.id !== targetPlaylistId) return pl;

                if (pl.songs.some((s) => s.id == addedSong.id)) return pl;

                return {
                    ...pl,
                    songs: [...pl.songs, addedSong]
                };
            })
        );
    };

    //Add remove from playlist handler.
    const handleDeleteSongFromPlaylist = (playlistId: string, songId: string) => {
        setPlaylists((prev) =>
            prev.map((pl) => {
                if (pl.id !== playlistId) return pl;

                return {
                    ...pl,
                    songs: pl.songs.filter((song) => song.id === songId),
                };
            })
        );
    };

    //Sidebar handler for adding playlists
    const handleCreatePlaylist = (name: string) => {
        const newPlaylist: Playlist = {
            id: `playlist-${Date.now()}`, //unique generated per current time
            name: name.trim(),
            songs: [],
        };

        setPlaylists((prev) => [...prev, newPlaylist]);
    };

    //Sidebar handler for deleting playlists
    const handleDeletePlaylist = (removeId: string) => {
        if (removeId === 'library') return;
        
        setPlaylists((prevPlaylists) => prevPlaylists.filter((pl) => pl.id !== removeId));

        if (selectedPlaylistId === removeId) {
            setSelectedPlaylistId('library');
        }
    };

    return (
        
        <div style={{display: 'flex', gap: '24px', maxWidth: '1100px', margin: '40px auto', alignItems: 'flex-start'}}>
          
            <main className="app-container">

                {/*Test of display for basic Sidebar implementation*/}
                <Sidebar
                    playlists={playlists}
                    selectedPlaylistId={selectedPlaylistId}
                    onSelectPlaylist={setSelectedPlaylistId}
                    onCreatePlaylist={handleCreatePlaylist}
                    onDeletePlaylist={handleDeletePlaylist}
                >
                </Sidebar>

                <div className="main-block">
                    <Header/>

                    <p>Use this form to upload to 'All Uploads' playlist.</p>
                    <UploadForm onUploadSuccess={handleUploadSuccess} />

                    <AudioPlayer
                        currentSong={currentSong}
                        loopFlag={loopFlag}
                        onToggleLoop={toggleLoop}
                    >
                    </AudioPlayer>

                    <PlayList 
                        playlist={activePlaylist}
                        playlists={playlists}
                        currentSong={currentSong}
                        onSelectSong={(song, index) => {
                            setCurrentSong(song);
                            setLoopFlag(false);
                        }}

                        //use undefined conditional to decide what value to pass to PlayList.tsx
                        onDeleteSong={activePlaylist.id === 'library' ? handleDeleteSong : undefined}
                        onRemoveFromPlaylist={activePlaylist.id !== 'library' 
                            ? (songId) => handleDeleteSongFromPlaylist(activePlaylist.id, songId) : undefined}
                        
                        onAddSongToPlaylist={handleAddSongToPlaylist}
                    />  
                </div>

            </main>
        </div>
    )
}