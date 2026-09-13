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

    //GET songs useEffect
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

    //Add to playlist onClick handler
    const handleAddSongToPlaylist = async (targetPlaylistId: string, addedSong: Song) => {
        //If default upload bucket do not execute handler
        if (targetPlaylistId === 'library') return;
        
        try {
            //Fetch from backend
            const res = await fetch(`http://localhost:5000/api/playlists/${targetPlaylistId}/songs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ songId: addedSong.id })
            });

            if (!res.ok) {
                console.error('Failed to add song to playlist on backend')
                return;
            }

            //Update frontend state
            setPlaylists((prevPlaylists) => 
                prevPlaylists.map((pl) => {
                    if (pl.id !== targetPlaylistId) return pl;

                    if (pl.songs.some((s) => s.id === addedSong.id)) return pl;

                    return {
                        ...pl,
                        songs: [...pl.songs, addedSong]
                    };
                })
            );
        } catch (err) {
            console.error('Error adding song to playlist:', err);
        }
    };

    //Delete from playlist handler
    const handleDeleteSongFromPlaylist = async (playlistId: string, songId: string) => {
        if (playlistId === 'library') return

        try {
        
            const res = await fetch(`http://localhost:5000/api/playlists/${playlistId}/songs/${songId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) {
                console.error('Failed to remove song from playlist on backend')
                return;
            }
            
            setPlaylists((prev) =>
                prev.map((pl) => {
                    if (pl.id !== playlistId) return pl;

                    return {
                        ...pl,
                        songs: pl.songs.filter((song) => song.id !== songId),
                    };
                })
            );
        } catch (err) {
            console.error('Error removing song from playlist:', err);
        }
    };

    return {
        songs,
        setSongs,
        playlists,
        setPlaylists,
        handleAddSongToPlaylist,
        handleDeleteSongFromPlaylist
    };
}