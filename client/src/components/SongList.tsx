import { useState, useEffect } from 'react';

export default function SongList() {
    const [songs, setSongs] = useState<string[]>([]);

    useEffect(() => {
        //Fetch json
        fetch('http://localhost:5000/api/tracks')
            .then((res) => res.json())
            .then((songData) => {
                setSongs(songData.songs)
            })
            .catch((err) => console.error('Failed to load songs', err));
    }, []);

    return (
        <ul>
            {songs.map((songName, index) => (
                <li key={index}>
                    {index + 1}. {songName};
                </li>
            ))}
        </ul>
    )
}