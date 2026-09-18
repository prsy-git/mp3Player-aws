import './index.css';
import {Song, Playlist} from './types';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import AudioPlayer from './components/AudioPlayer';
import PlayList from './components/PlayList';
import Sidebar from './components/Sidebar';
import AuthenticationForm from './components/AuthenticationForm';

//hooks
import { useAuth } from './hooks/useAuth';
import { useLibrary } from './hooks/useLibrary';

export default function App() {

    //states to manage that are relevant for multiple components / across the app
    const [currentSong, setCurrentSong] = useState<Song | null>(null)
    const [refreshFlag, setRefreshFlag] = useState<number>(0);
    const [loopFlag, setLoopFlag] = useState<boolean>(false);
    
    //Hook declarations
    const {
        user,
        setUser,
        authenticationLoading,
        handleLogout,
    } = useAuth();

    const {
        playlists,
        setPlaylists,
        handleAddSongToPlaylist,
        handleDeleteSongFromPlaylist
    } = useLibrary(refreshFlag, user);
    
    /* --- Code relevant to the function of general routing and handling for the app components --- */
    /* --- Array / Queue Objects Needed for Implementation Across the App */
    
    //Queue for managing shuffle play functionality
    const [autoplayQueue, setAutoplayQueue] = useState<Song[]>([]);

    /* ------------------------------------------------------------------ */

    //Track state of currently selected playlist id element (by default / on startup, library)
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('library');

    //Active playlist object dervied from id
    const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

    
    //Add to playlist onClick handler -- DEPRECATED AFTER MOVING HOOK
    // const handleAddSongToPlaylist = async (targetPlaylistId: string, addedSong: Song) => {
    //     //If default upload bucket do not execute handler
    //     if (targetPlaylistId === 'library') return;
        
    //     try {
    //         //Fetch from backend
    //         const res = await fetch(`http://localhost:5000/api/playlists/${targetPlaylistId}/songs`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify({ songId: addedSong.id })
    //         });

    //         if (!res.ok) {
    //             console.error('Failed to add song to playlist on backend')
    //             return;
    //         }

    //         //Update frontend state
    //         setPlaylists((prevPlaylists) => 
    //             prevPlaylists.map((pl) => {
    //                 if (pl.id !== targetPlaylistId) return pl;

    //                 if (pl.songs.some((s) => s.id === addedSong.id)) return pl;

    //                 return {
    //                     ...pl,
    //                     songs: [...pl.songs, addedSong]
    //                 };
    //             })
    //         );
    //     } catch (err) {
    //         console.error('Error adding song to playlist:', err);
    //     }
    // };

    //Delete from playlist handler -- DEPRECATED AFTER MOVING TO HOOK
    // const handleDeleteSongFromPlaylist = async (playlistId: string, songId: string) => {
    //     if (playlistId === 'library') return

    //     try {
        
    //         const res = await fetch(`http://localhost:5000/api/playlists/${playlistId}/songs/${songId}`, {
    //             method: 'DELETE',
    //             credentials: 'include'
    //         });

    //         if (!res.ok) {
    //             console.error('Failed to remove song from playlist on backend')
    //             return;
    //         }
            
    //         setPlaylists((prev) =>
    //             prev.map((pl) => {
    //                 if (pl.id !== playlistId) return pl;

    //                 return {
    //                     ...pl,
    //                     songs: pl.songs.filter((song) => song.id !== songId),
    //                 };
    //             })
    //         );
    //     } catch (err) {
    //         console.error('Error removing song from playlist:', err);
    //     }
    // };

    // Backend delete for playlist items handler updated to utilize database ID
    const handleDeleteSong = async (songId: string) => {
        try {
            const res = await fetch(`/api/songs/${songId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                if (currentSong?.id == songId) {
                    setCurrentSong(null);
                }

                setPlaylists((prev) =>
                    prev.map((playlist) => ({
                        ...playlist,
                        songs: playlist.songs.filter((song) => song.id !== songId),
                    }))
                );
            } else {
                console.error('Failed to delete track from backend server.');
            }
        } catch (err) {
            console.error('Error deleting track', err);
        }
    };

    // Refresh library after a successful upload
    const handleUploadSuccess = () => {
        setRefreshFlag((prev) => prev + 1);
    };

    // Toggle loop playback
    const toggleLoop = () => {
        setLoopFlag((prev) => !prev);
    };

    //Sidebar handler for adding playlists
    const handleCreatePlaylist = async (name: string) => {
        try {
            const res = await fetch(`/api/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                console.error('Failed to create playlist on backend');
                return;
            }

            const data: { playlistId: number, name: string } = await res.json();

            const newPlaylist: Playlist = {
                id: String(data.playlistId),
                name: data.name,
                songs: []
            };

            setPlaylists((prev) => [...prev, newPlaylist]);
            setSelectedPlaylistId(String(data.playlistId));
        } catch (err) {
            console.error('Error creating playlist:', err);
        }
    };

    //Sidebar handler for deleting playlists
    const handleDeletePlaylist = async (removeId: string) => {

        const targetPlaylist = playlists.find((pl) => pl.id === removeId)

        if (removeId === 'library' || targetPlaylist?.name.toLocaleLowerCase() === 'favorites') return;
        
        try {
            const res = await fetch(`/api/playlists/${removeId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!res.ok) {
                console.error('Failed to delete playlist on backend')
                return;
            }

            //Change react state if successful
            setPlaylists((prevPlaylists) => prevPlaylists.filter((pl) => pl.id !== removeId));

            if (selectedPlaylistId === removeId) {
                setSelectedPlaylistId('library');
            }

        } catch (err) {
            console.error('Error deleting playlist:', err);
        }
    };

    /* Autoplay / shuffle functionality for state and handlers */
    const [isAutoplaying, setIsAutoPlaying] = useState<boolean>(false);
    const [isShuffled, setIsShuffled] = useState<boolean>(false);

    //Autoplay handler for populating queue starting from selected song (clause to respect if shuffle is turned on)
    const handleSelectSong = (song: Song, index?: number) => {
        setCurrentSong(song);
        setLoopFlag(false);
        
        //If shuffle is turned on, randomly select from remaining
        if (isShuffled) {
            //Take all other songs in chosen playlist via filtering
            const remaining = activePlaylist.songs.filter((s) => s.id !== song.id)

            //Spread remaining array and mix with Math random (temporarily)
            const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);

            //Append picked song to queue, followed by the shuffled remaining songs
            setAutoplayQueue([song, ... shuffledRemaining]);
        }
        
        //Default behavior for populating autoplay queue if not shuffling
        else {
            const selectedIndex = 
                index !== undefined ? index : activePlaylist.songs.findIndex((s) => s.id === song.id);

            if (selectedIndex !== -1) {
                setAutoplayQueue(activePlaylist.songs.slice(selectedIndex));
            }
        }
    };

    

    //Handler for populating queue on a shuffle operation
    const toggleShuffle = () => {
        setIsShuffled((prev) => {
            const nextState = !prev;


            if (nextState) {
                //Force autoplay on if shuffle is active
                setIsAutoPlaying(true);

                if (currentSong) {
                    const remaining = activePlaylist.songs.filter((s) => s.id !== currentSong.id);
                    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
                    setAutoplayQueue([currentSong, ...shuffledRemaining]);
                }
            }

            else {
                //Set back to ordered sequence from current position in queue
                if (currentSong) {
                    const currentIndex = activePlaylist.songs.findIndex((s) => s.id === currentSong.id);
                    if (currentIndex !== -1) {
                        setAutoplayQueue(activePlaylist.songs.slice(currentIndex));
                    }
                }
            }

            return nextState;
        });
    }
    
    
    //Autoplay handler for song ending behavior
    const handleSongEnded = () => {
        if (!isAutoplaying || autoplayQueue.length <= 1) return;

        const nextSong = autoplayQueue[1];

        setCurrentSong(nextSong);

        setAutoplayQueue((prevQueue) => prevQueue.slice(1));
    };

    //Next previous handler buttons
    const handleNextSong = () => {
        if (autoplayQueue.length <= 1) return;
        const nextSong = autoplayQueue[1];
        setCurrentSong(nextSong);
        setAutoplayQueue((prevQueue) => prevQueue.slice(1));
    };

    const handlePrevSong = () => {
        const currentIndex = activePlaylist.songs.findIndex((s) => s.id === currentSong?.id);
        if (currentIndex > 0) {
            const prevSong = activePlaylist.songs[currentIndex - 1];
            handleSelectSong(prevSong, currentIndex - 1);
        }
    };

    //useEffect to update queue when switching active playlist
    useEffect(() => {
        if (!currentSong) return;

        if (isShuffled) {
            //Keep song at first index and shuffle remaining queue
            const remaining = activePlaylist.songs.filter((s) => s.id !== currentSong.id);
            const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
            setAutoplayQueue([currentSong, ...shuffledRemaining]);
        }

        else {
            //Keep standard order from position current song to end of playlist
            const currentIndex = activePlaylist.songs.findIndex((s) => s.id === currentSong.id)
            if (currentIndex !== -1) {
                setAutoplayQueue(activePlaylist.songs.slice(currentIndex));
            }
        }
    }, [selectedPlaylistId]);

    /* End autoplay code segment */

    /* --- Conditionally display authentication in progress alternative display --- */
    if (authenticationLoading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif'}}>
                <p>Loading application session with authenticator...</p>
            </div>
        );
    }

    // Logged out user display
    if (!user) {
        return (
            <AuthenticationForm
                onAuthSuccess={(userId) => setUser( {userId} )}
            />
        );
    }

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
                    <Header userId={user?.userId ?? null} onLogout={handleLogout}/>

                    <p>Use this form to upload to 'All Uploads' playlist.</p>
                    <UploadForm onUploadSuccess={handleUploadSuccess} />

                    <AudioPlayer
                        currentSong={currentSong}
                        loopFlag={loopFlag}
                        onToggleLoop={toggleLoop}
                        onEnded={handleSongEnded}

                        isAutoplaying={isAutoplaying}
                        onToggleAutoplay={() => setIsAutoPlaying(prev => !prev)}
                        isShuffled={isShuffled}
                        onToggleShuffle={toggleShuffle}
                        onNext={handleNextSong}
                        onPrev={handlePrevSong}
                        hasNext={autoplayQueue.length > 1}
                        hasPrev={
                            activePlaylist.songs.findIndex((s) => s.id === currentSong?.id) > 0
                        }
                    >
                    </AudioPlayer>

                    <PlayList 
                        playlist={activePlaylist}
                        playlists={playlists}
                        currentSong={currentSong}
                        onSelectSong={handleSelectSong}

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