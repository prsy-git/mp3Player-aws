import './index.css';
import {Song, Playlist} from './types';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import AudioPlayer from './components/AudioPlayer';
import PlayList from './components/PlayList';

export default function App() {
    
    //states to manage that are relevant for multiple components / across the app
    const [currentSong, setCurrentSong] = useState<Song | null>(null)
    const [refreshFlag, setRefreshFlag] = useState<number>(0);
    const [loopFlag, setLoopFlag] = useState<boolean>(false);

    //Library playlist controlled from app for now
    const [libraryPlaylist, setLibraryPlaylist] = useState<Playlist>({
        id: 'library',
        name: 'All Uploads',
        songs: []
    })

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

                setLibraryPlaylist({
                    id: 'library',
                    name: 'All Uploads',
                    songs: inFormatSongs
                });
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
                setLibraryPlaylist((prev) => ({
                    ...prev,
                    songs: prev.songs.filter((song) => song.id !== songId),
                }));
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

            {/*New implementation of SongList turned into PlayList data structure*/}
            <PlayList 
                playlist={libraryPlaylist}
                currentSong={currentSong}
                onSelectSong={(song, index) => {
                    setCurrentSong(song);
                    setLoopFlag(false);
                }}
            />
        
        </main>
    )
}