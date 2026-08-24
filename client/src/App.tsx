import { useState, useEffect } from 'react';
import StatusBadge from './components/StatusCheck';
import SongList from './components/SongList';
import UploadForm from './components/UploadForm';

export default function App() {
    
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
        <header>
            <h1>Music App</h1>
            <StatusBadge />
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>File upload form</p>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
            
            <p>Test to display SongList component</p>
            <SongList 
                key={refreshFlag}
                onSelectSong={(songName) => setCurrentSong(songName)}
            />
            
            <p>Selected track: {currentSong ?? 'None'}</p>
            {currentSong && (
                <>    
                    <audio 
                        key={currentSong}
                        loop = {loopFlag}
                        controls
                        autoPlay
                        src={`http://localhost:5000/uploads/${encodeURIComponent(currentSong)}`}
                    />

                    <button type="button" onClick={toggleLoop}>
                        Loop Current Song: {loopFlag ? 'ON' : 'OFF'} 
                    </button>
                </>
            )}

        </div>
        
        </>
    )
}