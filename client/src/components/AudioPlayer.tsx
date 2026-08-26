import {useState, useEffect, useRef} from 'react';

interface AudioPlayerProps {
  currentSong: string | null;
  loopFlag: boolean;
  onToggleLoop: () => void;
}

export default function AudioPlayer({currentSong, loopFlag, onToggleLoop}: AudioPlayerProps) {
    //get reference to audio element for custom player
    const audioReference = useRef<HTMLAudioElement | null>(null);

    //track playing state of audio
    const [isPlaying, setPlaying] = useState<boolean>(false);

    //states for duration and timestamp of audio
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);

    //function to set play state
    const changePlayState = () => {
        if (!audioReference.current) return; //is null value for reference

        if (isPlaying) {
            audioReference.current.pause();
        } else {
            audioReference.current.play();
        }
        
        setPlaying(prev => !prev);
    }

    //useEffect for autoplay on song click
    useEffect (() => {
        //update only when currentSong is not null
        if (currentSong && audioReference.current) {
            audioReference.current.play()
            .then(() => {
                setPlaying(true);
            })
            .catch((err) => {
                console.error("Failed automatic play via useEffect onClick", err);
            })
        }
    }, [currentSong])

    //useEffect for loop on current audioReference
    useEffect (() => {
        //update when currentsong not null
        if (currentSong && audioReference.current) {
            audioReference.current.loop = loopFlag
        }
    }, [loopFlag])

    return (
        <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p className='selected-track'>Selected track: {currentSong ?? 'None'}</p>
            {currentSong && (
                <>    
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>   
                        <audio 
                            ref={audioReference}
                            src={`http://localhost:5000/uploads/${encodeURIComponent(currentSong)}`}
                            onLoadedMetadata={(e) => {
                                setDuration(e.currentTarget.duration);
                            }}
                            onTimeUpdate={(e) => {
                                setCurrentTime(e.currentTarget.currentTime);
                            }}
                        />

                        {/* Custom Audio Slider implementation w/ useRef hook */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '400px'}}>
                            <span>{Math.floor(currentTime)}s</span>
                            <input
                                type='range'
                                min={0}
                                max={duration || 0}
                                value={currentTime}
                                onChange={(e) => {
                                    const newDisplayTime = Number(e.target.value);
                                    setCurrentTime(newDisplayTime);
                                    if (audioReference.current) {
                                        audioReference.current.currentTime = newDisplayTime;
                                    }
                                }}
                                style={{ flex: 1 }}
                            />
                            <span>{Math.floor(duration)}s</span>
                        </div>

                        <button 
                            type="button" 
                            onClick={(changePlayState)}
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        
                        <button type="button" onClick={onToggleLoop}>
                            Loop Current Song: {loopFlag ? 'ON' : 'OFF'} 
                        </button>
                    </div> 
                </>
            )}
        </div>
    );
};