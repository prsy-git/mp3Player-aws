import { useState, useEffect } from 'react';
import Header from './components/Header';
import SongList from './components/SongList';
import UploadForm from './components/UploadForm';
import AudioPlayer from './components/AudioPlayer';

export default function App() {
    
    //must be kept in app for currentSong access
    const [currentSong, setCurrentSong] = useState<string | null>(null)
    
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
        <>
        <Header></Header>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>File upload form</p>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
            
            <p>Test to display SongList component</p>
            <SongList 
                key={refreshFlag}
                onSelectSong={(songName) => {
                    setCurrentSong(songName)
                    setLoopFlag(false);    
                }}
            />

            <AudioPlayer
                currentSong={currentSong}
                loopFlag={loopFlag}
                onToggleLoop={toggleLoop}
            >

            </AudioPlayer>
        </div>
        
        </>
    )
}