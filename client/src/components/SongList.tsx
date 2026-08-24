import { useState, useEffect } from 'react';

//define type/interface to allow import of prop
interface SongListProps {
    onSelectSong: (songName: string) => void;
}

export default function SongList({ onSelectSong }: SongListProps) {
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
                <li key={index} 
                    style={{ cursor: 'pointer', padding: '8px', userSelect: 'none'}}
                    onClick={() => {
                        console.log(songName)
                        onSelectSong(songName)
                        }}>
                    {index + 1}. {songName}
                </li>
            ))}
        </ul>
    )
}