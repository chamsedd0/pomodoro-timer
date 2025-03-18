import React, { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';
import { PlayIcon, PauseIcon, ArrowPathIcon, ChartBarIcon, SpeakerWaveIcon, SpeakerXMarkIcon, MusicalNoteIcon, ArrowPathRoundedSquareIcon, ForwardIcon } from '@heroicons/react/24/solid';
import './App.css';

// Define the different Pomodoro modes
const MODES = {
  LIGHT: { work: 25 * 60, break: 5 * 60, label: 'Light' },
  DEEP: { work: 30 * 60, break: 7 * 60, label: 'Deep' },
  MANIAC: { work: 45 * 60, break: 12 * 60, label: 'Maniac' },
  CUSTOM: { work: 0, break: 0, label: 'Custom' }
};

// Lofi music tracks
const LOFI_TRACKS = [
  {
    name: "Lofi Study",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
  },
  {
    name: "Lofi Chill",
    url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946f4a8e56.mp3?filename=lofi-chill-medium-version-159456.mp3"
  }
];

// Binaural beats tracks
const BINAURAL_TRACKS = [
  {
    name: "Alpha Waves",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8a98bfa23.mp3?filename=alpha-waves-10min-7hz-binaural-beats-for-study-and-concentration-8558.mp3"
  },
  {
    name: "Deep Focus",
    url: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=deep-meditation-138-11652.mp3"
  }
];

// Pop music tracks
const POP_TRACKS = [
  {
    name: "Summer Pop",
    url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_1333dfb36b.mp3?filename=summer-walk-152722.mp3"
  },
  {
    name: "Happy Vibes",
    url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_e36e3e1ae5.mp3?filename=happy-ukulele-159444.mp3"
  }
];

function App() {
  // State variables
  const [mode, setMode] = useState('LIGHT');
  const [timeLeft, setTimeLeft] = useState(MODES.LIGHT.work);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [particles, setParticles] = useState([]);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [lofiVolume, setLofiVolume] = useState(0.3);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [currentMusicType, setCurrentMusicType] = useState('lofi');
  const [currentTracks, setCurrentTracks] = useState(LOFI_TRACKS);
  
  // Custom mode inputs
  const [customWorkMinutes, setCustomWorkMinutes] = useState(25);
  const [customBreakMinutes, setCustomBreakMinutes] = useState(5);
  const [showCustom, setShowCustom] = useState(false);

  // Sound effects
  const [playAlarm] = useSound('/alarm.mp3', { volume: 0.5 });
  
  // Lofi music audio ref
  const lofiAudioRef = useRef(null);

  // Refs for progress circles
  const outerCircleRef = useRef(null);
  const innerCircleRef = useRef(null);

  // Initialize lofi audio
  useEffect(() => {
    if (!lofiAudioRef.current) {
      lofiAudioRef.current = new Audio(currentTracks[currentTrackIndex].url);
      lofiAudioRef.current.loop = true;
      lofiAudioRef.current.volume = lofiVolume;
      
      // Handle audio ended event to play next track
      lofiAudioRef.current.addEventListener('ended', () => {
        const nextTrackIndex = (currentTrackIndex + 1) % currentTracks.length;
        setCurrentTrackIndex(nextTrackIndex);
        lofiAudioRef.current.src = currentTracks[nextTrackIndex].url;
        if (isLofiPlaying) {
          lofiAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      });
    }

    return () => {
      if (lofiAudioRef.current) {
        lofiAudioRef.current.pause();
        lofiAudioRef.current.removeEventListener('ended', () => {});
      }
    };
  }, [currentTracks]);

  // Update lofi volume when changed
  useEffect(() => {
    if (lofiAudioRef.current) {
      lofiAudioRef.current.volume = lofiVolume;
    }
  }, [lofiVolume]);

  // Update lofi track when changed
  useEffect(() => {
    if (lofiAudioRef.current) {
      lofiAudioRef.current.src = currentTracks[currentTrackIndex].url;
      if (isLofiPlaying) {
        lofiAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  }, [currentTrackIndex, currentTracks]);

  // Auto-play lofi music when in Deep mode
  useEffect(() => {
    if (mode === 'DEEP' && isRunning && !isBreak) {
      toggleLofi(true);
    }
  }, [mode, isRunning, isBreak]);

  // Toggle lofi music
  const toggleLofi = (forceState = null) => {
    const newState = forceState !== null ? forceState : !isLofiPlaying;
    
    if (newState) {
      lofiAudioRef.current.play().catch(e => {
        console.log('Audio play failed:', e);
        // If autoplay is blocked, we'll need user interaction
        alert('Please click the lofi music button again to play music (browser autoplay restrictions)');
      });
    } else {
      lofiAudioRef.current.pause();
    }
    
    setIsLofiPlaying(newState);
  };

  // Change lofi track
  const changeLofiTrack = () => {
    const nextTrackIndex = (currentTrackIndex + 1) % currentTracks.length;
    setCurrentTrackIndex(nextTrackIndex);
  };

  // Change music type
  const changeMusicType = (type) => {
    let tracks;
    switch(type) {
      case 'lofi':
        tracks = LOFI_TRACKS;
        break;
      case 'binaural':
        tracks = BINAURAL_TRACKS;
        break;
      case 'pop':
        tracks = POP_TRACKS;
        break;
      default:
        tracks = LOFI_TRACKS;
    }
    
    setCurrentMusicType(type);
    setCurrentTracks(tracks);
    setCurrentTrackIndex(0);
    
    // Update the audio source
    if (lofiAudioRef.current) {
      lofiAudioRef.current.src = tracks[0].url;
      if (isLofiPlaying) {
        lofiAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }
    
    // Hide the menu after selection
    setShowMusicMenu(false);
  };

  // Generate particles for background effect
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * 4 + 1,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5
        });
      }
      setParticles(newParticles);
    };
    
    generateParticles();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            playAlarm();
            
            // If work period is ending, update stats
            if (!isBreak) {
              setCycles(c => c + 1);
              setTotalWorkTime(t => t + MODES[mode].work);
              
              // Add to session history
              const now = new Date();
              setSessionHistory(prev => [...prev, {
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                mode: mode,
                duration: MODES[mode].work / 60
              }]);
            }
            
            // Toggle between work and break
            const newIsBreak = !isBreak;
            setIsBreak(newIsBreak);
            
            // Important: Pause the timer to prevent continuous alarm
            setIsRunning(false);
            
            // Return the appropriate time for the next phase
            return newIsBreak ? MODES[mode].break : MODES[mode].work;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isBreak, mode, playAlarm]);

  // Calculate SVG circle properties for countdown style
  const calculateCircleProps = (timeLeft, total, isMinuteRing = false) => {
    const radius = isMinuteRing ? 90 : 120;
    const circumference = 2 * Math.PI * radius;
    
    // For countdown, we want to start at 0 offset (full circle) and increase the offset as time decreases
    let progress;
    if (isMinuteRing) {
      // For minute ring, create a continuous flowing animation
      // We want it to complete one full rotation every minute
      // But we want it to flow continuously without resetting
      
      // Get the seconds within the current minute (0-59)
      const secondsInMinute = timeLeft % 60;
      
      // Calculate progress based on seconds in minute (0 to 1)
      // We invert it so that it empties as the minute progresses
      progress = 1 - (secondsInMinute / 60);
    } else {
      // For total ring, we want it to complete one full rotation over the total time
      progress = timeLeft / total;
    }
    
    // Calculate the stroke-dashoffset (starts at 0 for full circle, increases to circumference for empty)
    const offset = circumference - (progress * circumference);
    
    return {
      radius,
      circumference,
      offset
    };
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString(),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    if (newMode === 'CUSTOM') {
      setShowCustom(true);
      return;
    }
    
    setMode(newMode);
    setTimeLeft(MODES[newMode].work);
    setIsBreak(false);
    setIsRunning(false);
    setShowCustom(false);
  };

  // Apply custom mode
  const applyCustomMode = () => {
    // Update MODES object with custom values
    MODES.CUSTOM.work = customWorkMinutes * 60;
    MODES.CUSTOM.break = customBreakMinutes * 60;
    
    // Set mode to custom
    setMode('CUSTOM');
    setTimeLeft(MODES.CUSTOM.work);
    setIsBreak(false);
    setIsRunning(false);
    setShowCustom(false);
  };

  // Reset timer
  const resetTimer = () => {
    setTimeLeft(isBreak ? MODES[mode].break : MODES[mode].work);
    setIsRunning(false);
  };

  // Toggle stats view
  const toggleStats = () => {
    setShowStats(!showStats);
  };

  // Format time for display
  const { minutes, seconds } = formatTime(timeLeft);

  // Calculate circle properties
  const total = isBreak ? MODES[mode].break : MODES[mode].work;
  const outerCircleProps = calculateCircleProps(timeLeft, total);
  const innerCircleProps = calculateCircleProps(timeLeft, total, true);

  // Determine background class based on timer state
  const backgroundClass = isRunning 
    ? isBreak ? 'running break' : 'running' 
    : isBreak ? 'paused break' : 'paused';

  // Generate dynamic status message
  const getStatusMessage = () => {
    if (isBreak) {
      return isRunning 
        ? "Take a moment to breathe and recharge" 
        : "Break time - Click play to start your break";
    } else {
      return isRunning 
        ? "Focus on your task, you're doing great!" 
        : "Timer paused - Click play when ready to focus";
    }
  };

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      {/* Background Particles */}
      <div className="background-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* Lofi Music Controls */}
      <div className="lofi-controls">
        <button 
          className={`lofi-button ${isLofiPlaying ? 'active' : ''}`}
          onClick={() => toggleLofi()}
          title={isLofiPlaying ? "Pause Lofi Music" : "Play Lofi Music"}
        >
          {isLofiPlaying ? 
            <SpeakerWaveIcon style={{ width: '16px', height: '16px' }} /> : 
            <SpeakerXMarkIcon style={{ width: '16px', height: '16px' }} />
          }
        </button>
        
        {isLofiPlaying && (
          <>
            <button 
              className="lofi-button"
              onClick={changeLofiTrack}
              title="Next Track"
            >
              <ForwardIcon style={{ width: '16px', height: '16px' }} />
            </button>
            
            <button 
              className="lofi-button"
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              title="Volume Control"
            >
              <MusicalNoteIcon style={{ width: '16px', height: '16px' }} />
            </button>
          </>
        )}
        
        {showVolumeControl && (
          <div className="volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={lofiVolume}
              onChange={(e) => setLofiVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
        )}
      </div>
      
      {/* Lofi Music Indicator */}
      {isLofiPlaying && (
        <div className="lofi-indicator" onClick={() => setShowMusicMenu(!showMusicMenu)}>
          <div className="lofi-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="lofi-text">{currentTracks[currentTrackIndex].name}</span>
        </div>
      )}
      
      {/* Music Type Menu */}
      {showMusicMenu && (
        <div className="music-menu">
          <div className="music-menu-title">Select Music Type</div>
          <div 
            className={`music-menu-item ${currentMusicType === 'lofi' ? 'active' : ''}`}
            onClick={() => changeMusicType('lofi')}
          >
            Lofi Beats
          </div>
          <div 
            className={`music-menu-item ${currentMusicType === 'binaural' ? 'active' : ''}`}
            onClick={() => changeMusicType('binaural')}
          >
            Binaural Waves
          </div>
          <div 
            className={`music-menu-item ${currentMusicType === 'pop' ? 'active' : ''}`}
            onClick={() => changeMusicType('pop')}
          >
            Pop Music
          </div>
        </div>
      )}
      
      <div className="max-w-md" style={{ marginTop: "50px" }}>
        {/* SVG Timer */}
        <div className="timer-container">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Background Circle */}
            <circle 
              cx="150" 
              cy="150" 
              r="150" 
              fill="transparent" 
            />
            
            {/* Outer Circle - Total Progress */}
            <circle 
              cx="150" 
              cy="150" 
              r={outerCircleProps.radius} 
              fill="transparent" 
              stroke={isBreak ? '#4cd964' : '#ff375f'} 
              strokeWidth="18" 
              strokeDasharray={outerCircleProps.circumference} 
              strokeDashoffset={outerCircleProps.offset}
              strokeLinecap="round"
              transform="rotate(-90, 150, 150)"
              className="timer-circle"
            />
            
            {/* Inner Circle - Minute Progress */}
            <circle 
              cx="150" 
              cy="150" 
              r={innerCircleProps.radius} 
              fill="transparent" 
              stroke={isBreak ? '#7ed957' : '#5ac8fa'} 
              strokeWidth="18" 
              strokeDasharray={innerCircleProps.circumference} 
              strokeDashoffset={innerCircleProps.offset}
              strokeLinecap="round"
              transform="rotate(-90, 150, 150)"
              className="timer-circle"
            />
          </svg>
          
          {/* Center with Time Display */}
          <div className="timer-center">
            <div className="timer-time">{minutes}</div>
            <div className="timer-seconds">{seconds}</div>
            <div className="timer-label">{isBreak ? 'Break' : 'Focus'}</div>
          </div>
        </div>
        
        {/* Current Status */}
        <div className="text-center status-container">
          <p className="text-lg font-medium status-title" style={{ color: '#ffffff' }}>
            {isBreak ? 'Break Time' : 'Focus Time'} - {isRunning ? 'Running' : 'Paused'}
          </p>
          <p className="text-sm opacity-80 mt-1 status-message" style={{ color: isBreak ? '#4cd964' : '#5ac8fa' }}>
            {getStatusMessage()}
          </p>
        </div>
        
        {/* Mode Selection */}
        <div className="mode-buttons">
          {Object.keys(MODES).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`mode-button ${mode === m ? 'active' : ''}`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Custom Mode Inputs */}
        {showCustom && (
          <div className="custom-mode animate-fade-in">
            <div className="custom-mode-header">
              <h3>Custom Timer</h3>
              <button 
                className="custom-close-button" 
                onClick={() => setShowCustom(false)}
                aria-label="Close custom mode"
              >
                ×
              </button>
            </div>
            <div className="custom-mode-inputs">
              <div>
                <input
                  type="number"
                  className="custom-input"
                  value={customWorkMinutes}
                  onChange={(e) => setCustomWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  aria-label="Work minutes"
                />
                <span className="custom-input-label">Work (min)</span>
              </div>
              <div>
                <input
                  type="number"
                  className="custom-input"
                  value={customBreakMinutes}
                  onChange={(e) => setCustomBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  aria-label="Break minutes"
                />
                <span className="custom-input-label">Break (min)</span>
              </div>
            </div>
            <button className="apply-button" onClick={applyCustomMode}>
              Apply
            </button>
          </div>
        )}

        {/* Control Buttons */}
        <div className="control-buttons">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="control-button"
            aria-label={isRunning ? "Pause" : "Start"}
            title={isRunning ? "Pause" : "Start"}
          >
            {isRunning ? 
              <PauseIcon className="h-6 w-6" /> : 
              <PlayIcon className="h-6 w-6" />
            }
          </button>
          <button
            onClick={resetTimer}
            className="control-button"
            aria-label="Reset"
            title="Reset"
          >
            <ArrowPathIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={toggleStats}
            className="control-button"
            aria-label={showStats ? "Hide Stats" : "Show Stats"}
            title={showStats ? "Hide Stats" : "Show Stats"}
          >
            <ChartBarIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="stats-panel">
            <h3 className="stats-header">Productivity Stats</h3>
            
            <div className="stats-grid">
              <div className="stats-item">
                <p className="stats-label">Cycles</p>
                <p className="stats-value">{cycles}</p>
              </div>
              <div className="stats-item">
                <p className="stats-label">Focus Time</p>
                <p className="stats-value">{Math.round(totalWorkTime / 60)}m</p>
              </div>
            </div>
            
            {sessionHistory.length > 0 ? (
              <div className="max-h-60 overflow-y-auto mt-4">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Mode</th>
                      <th style={{ textAlign: 'right' }}>Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionHistory.map((session, index) => (
                      <tr key={index}>
                        <td>{session.time}</td>
                        <td>{session.mode}</td>
                        <td style={{ textAlign: 'right' }}>{session.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 opacity-70">No sessions completed yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
