import {useState, useEffect} from 'react';

interface AudioPlayerProps {
  currentSong: string | null;
  loopFlag: boolean;
  onToggleLoop: () => void;
}

export default function AudioPlayer({currentSong, loopFlag, onToggleLoop}: AudioPlayerProps) {

    return (
        <div>
            <p>Selected track: {currentSong ?? 'None'}</p>
            {currentSong && (
                <>    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>   
                        <audio 
                            key={currentSong}
                            loop = {loopFlag}
                            controls
                            autoPlay
                            src={`http://localhost:5000/uploads/${encodeURIComponent(currentSong)}`}
                        />

                        <button type="button" onClick={onToggleLoop}>
                            Loop Current Song: {loopFlag ? 'ON' : 'OFF'} 
                        </button>
                    </div> 
                </>
            )}
        </div>
    );
};