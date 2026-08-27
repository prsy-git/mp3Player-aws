import './index.css';
import {Song} from './types';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import SongList from './components/SongList';
import UploadForm from './components/UploadForm';
import AudioPlayer from './components/AudioPlayer';

export default function App() {
    
    //must be kept in app for currentSong access
    const [currentSong, setCurrentSong] = useState<Song | null>(null)
    
    //State toggle for page refresh on new file upload
    const [refreshFlag, setRefreshFlag] = useState<number>(0);

    const handleUploadSuccess = () => {
        setRefreshFlag((prev) => prev + 1);
    }

    //True false flag logic for loop conditional
    const [loopFlag, setLoopFlag] = useState<boolean>(false);

    const toggleLoop = () => {
        setLoopFlag(prev => !prev);
    }

    return (
        <main className="app-container">
        
            <Header/>

            <p>File upload form</p>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
            
            <p>Test to display SongList component</p>
            <SongList 
                key={refreshFlag}
                onSelectSong={(songName) => {
                    setCurrentSong({
                        id: songName,
                        title: songName,
                        //define with filler value for duration
                        duration: 0
                    });
                    setLoopFlag(false);    
                }}
            />

            <AudioPlayer
                currentSong={currentSong}
                loopFlag={loopFlag}
                onToggleLoop={toggleLoop}
            >

            </AudioPlayer>
        
        </main>
    )
}