import {useState, useEffect} from 'react';

interface AudioPlayerProps {
  currentSong: string | null;
  loopFlag: boolean;
  onToggleLoop: () => void;
}

export default function AudioPlayer({currentSong, loopFlag, onToggleLoop}: AudioPlayerProps) {

    return (
        <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p className='selected-track'>Selected track: {currentSong ?? 'None'}</p>
            {currentSong && (
                <>    
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>   
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