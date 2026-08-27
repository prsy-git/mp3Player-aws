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

    //delete handler
    const handleDelete = (songName: string) => {
        //filter for the songName to be dropped
        setSongs((prevSongs) => prevSongs.filter((song) => song !== songName))
    }


    return (
        <ul>
            {songs.map((songName, index) => (
                <li key={index} 
                    style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 12px',
                        gap: '12px',
                        cursor: 'pointer', 
                        userSelect: 'none',
                        boxSizing: 'border-box'
                    }}
                    onClick={() => {
                        console.log(songName)
                        onSelectSong(songName)
                        }}>
                    {index + 1}. {songName}

                    {/*Each line item should have a delete button removing the song from the list*/}
                    <button 
                        type="button" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(songName);
                        }}
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    )
}