import { useState, useEffect } from 'react';
import { Song, Playlist } from '../types';

interface ServerSong {
    songId: number;
    title: string;
    filePath: string;
}

interface ServerPlaylist {
    id: number;
    name: string;
    songs: {
        songId?: number;
        id?: number;
        title: string;
        filePath: string;
    }[];
}

export function useLibrary(refreshFlag: number, user: unknown) {
    const [songs, setSongs] = useState<Song[]>();
    const [playlists, setPlaylists] = useState<Playlist[]>([
        {
            id: 'library',
            name: 'All Uploads',
            songs: [],
        },
    ]);

    useEffect(() => {
            if (!user) return;
            
            fetch('http://localhost:5000/api/songs', {
                credentials: 'include',
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`Songs requested failed: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data: { songs: ServerSong[] }) => {
                    const rawSongs = data?.songs || [];
                    const inFormatSongs: Song[] = rawSongs.map((song) => ({
                        id: String(song.songId),
                        title: song.title,
                        duration: 0,
                        filePath: song.filePath
                    }));

                    setSongs(inFormatSongs);
    
                    //Fetch custom user DB playlists from backend
                    fetch('http://localhost:5000/api/playlists', {
                        credentials: 'include',
                    })
                        .then((res) => {
                            if (!res.ok) {
                                throw new Error(`Playlist request failed: ${res.status}`);
                            }
                            return res.json();
                        })
                        .then((playlistData: {playlists: ServerPlaylist[] }) => {
                            const rawPlaylists = playlistData?.playlists || [];
                            const customPlaylists: Playlist[] = rawPlaylists.map((pl) => {
                                return {
                                    id: String(pl.id),
                                    name: pl.name,
                                    songs: (pl.songs || []).map((s) => ({
                                        id: String(s.songId || s.id),
                                        title: s.title,
                                        duration: 0,
                                        filePath: s.filePath
                                    }))
                                };
                            });
    
                            setPlaylists([
                            { id: 'library', name: 'All Uploads', songs: inFormatSongs },
                            ...customPlaylists
                            ]);
                        })
                        .catch((err) => console.error('Could not load custom playlists:', err));
                })
    
                .catch((err) => console.error('Could not load library tracks:', err))
    }, [refreshFlag, user]);

    //Backend delete for playlist items handler updated to utilize database ID
    const handleDeleteSong = async (songId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/songs/${songId}`, {
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
            }

            else {
                console.error('Failed to delete track from backend server.');
            }
        }

        catch(err) {
            console.error('Error deleting track', err);
        }
    };

    return {
        songs,
        setSongs,
        playlists,
        setPlaylists
    };
}