import { AudioPlayerProps } from '../types';
import {useState, useEffect, useRef} from 'react';

export default function AudioPlayer({
    currentSong,
    loopFlag,
    onToggleLoop,
    onEnded,
    isAutoplaying,
    onToggleAutoplay,
    isShuffled,
    onToggleShuffle,
    onNext,
    onPrev,
    hasNext,
    hasPrev,
}: AudioPlayerProps) {
    //function to format time output on slider display
    const formatTime = (timeInSeconds: number): string => {
        if (!Number.isFinite(timeInSeconds) || timeInSeconds <= 0) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    //get reference to audio element for custom player
    const audioReference = useRef<HTMLAudioElement | null>(null);

    //track playing state of audio
    const [isPlaying, setPlaying] = useState<boolean>(false);

    //state for boolean tracking if slider is held
    const [sliderHeld, setSliderHeld] = useState<boolean>(false);

    //states for duration, timestamp, volume of audio
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [volume, setVolume] = useState<number>(1);

    //handler function to set play state
    const changePlayState = () => {
        if (!audioReference.current) return; //is null value for reference

        if (isPlaying) {
            audioReference.current.pause();
        } else {
            audioReference.current.play();
        }
        
        setPlaying(prev => !prev);
    }

    //handler function to update state and volume in <audio>
    const changeVolume = (newVolume: number) => {
        setVolume(newVolume);

        if (audioReference.current) {
            audioReference.current.volume = newVolume;
        }
    };

    //useEffect for autoplay on song click
    useEffect (() => {
        // Control old timestamps on track switch
        setCurrentTime(0);
        setDuration(0);
        setPlaying(false);
        
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
            <p className='selected-track'>Selected track: {currentSong?.title ?? 'None'}</p>
            {currentSong && (
                <>    
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>   
                        <audio 
                            ref={audioReference}
                            src={`http://localhost:5000/uploads/${encodeURIComponent(currentSong.title)}`}
                            onLoadedMetadata={(e) => {
                                const audioDuration = e.currentTarget.duration;
                                if (Number.isFinite(audioDuration)) {
                                    setDuration(audioDuration);
                                }
                            }}

                            onTimeUpdate={(e) => {
                                if (!sliderHeld) {
                                    const rawTime = e.currentTarget.currentTime;
                                    if (duration > 0) {
                                        setCurrentTime(Math.min(rawTime, duration));
                                    } else {
                                        setCurrentTime(rawTime);
                                    }
                                }
                            }}

                            onEnded={() => {
                                setPlaying(false);
                                if (!loopFlag && audioReference.current) {
                                    //set current time when audio ends as a secondary check
                                    setCurrentTime(duration);
                                    //Call queue handler
                                    if (onEnded) onEnded();
                                }
                            }}
                        />

                        {/* Custom Audio Slider implementation w/ useRef hook */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '400px'}}>
                            <span>{formatTime(currentTime)}s</span>
                            <input
                                type='range'
                                min={0}
                                max={duration || 0}
                                value={currentTime}
                                onMouseDown={() => setSliderHeld(true)}
                                onChange={(e) => {
                                    const newTime = Number(e.target.value);
                                    setCurrentTime(newTime);
                                }}
                                onMouseUp={(e) => {
                                    setSliderHeld(false);
                                    const finalTime = Number(e.currentTarget.value);
                                    if (audioReference.current) {
                                        audioReference.current.currentTime = finalTime;
                                    }
                                }}
                                style={{ flex: 1 }}
                            />
                            <span>{formatTime(duration)}s</span>
                        </div>

                        {/* Volume slider implementation */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <label htmlFor="volume-slider">Volume:</label>
                                <input
                                    id="volume-slider"
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={volume}
                                    onChange={(e) => changeVolume(Number(e.target.value))}
                                />
                                <span>{Math.round(volume * 100)}%</span>
                        </div>

                        {/* Navigation buttons */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <button type="button" onClick={onPrev} disabled={!hasPrev}>
                                    Prev
                                </button>

                                <button type="button" onClick={(changePlayState)}>
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>

                                <button type="button" onClick={onNext} disabled={!hasNext}>
                                    Next
                                </button>
                        </div>

                        {/* Mode buttons */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button type="button" onClick={onToggleLoop}>
                                Loop Current Song: {loopFlag ? 'ON' : 'OFF'} 
                            </button>

                            <button type="button" onClick={onToggleAutoplay}>
                                Autoplay: {isAutoplaying ? 'ON' : 'OFF'}
                            </button>

                            <button type="button" onClick={onToggleShuffle}>
                                Shuffle: {isShuffled ? 'ON' : 'OFF'}
                            </button>
                        </div>

                    </div> 
                </>
            )}
        </div>
    );
};