import React, { useState, useRef, useEffect } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RepeatIcon from '@mui/icons-material/Repeat';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
const AudioPlayer = ({ currentTrack, tracks, onPlayNext, onPlayPrev, onRename, onViewPrompt, onDelete, onShare }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentTrack && currentTrack.audio_url) {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val > 0) setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onPlayNext) onPlayNext();
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[88px] bg-[#141812] border-t border-white/5 flex items-center px-4 justify-between z-50">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#222] rounded overflow-hidden shrink-0 flex items-center justify-center">
            {currentTrack.image_url ? (
              <img src={currentTrack.image_url} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-2xl">🎵</span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="font-bold text-gray-100 text-[15px] leading-tight mb-1 truncate max-w-[200px]">
              {currentTrack.title || "Untitled Track"}
            </h4>
            <p className="text-[#8c918a] text-[13px] leading-none truncate max-w-[200px]">
              {currentTrack.artist || currentTrack.genre || "Unknown Artist"}
            </p>
          </div>
          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-4 text-gray-400">
          </div>
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-4">
        <div className="flex items-center justify-center gap-6 mb-2">
          <button className="text-gray-400 hover:text-white transition-colors hidden sm:block"><ShuffleIcon fontSize="small" /></button>
          <button onClick={onPlayPrev} className="text-white hover:text-emerald-400 transition-colors">
            <SkipPreviousIcon />
          </button>
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors hover:scale-105"
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </button>
          <button onClick={onPlayNext} className="text-white hover:text-emerald-400 transition-colors">
            <SkipNextIcon />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors hidden sm:block"><RepeatIcon fontSize="small" /></button>
        </div>
        <div className="flex items-center gap-3 w-full text-xs text-gray-400">
          <span className="w-10 text-right shrink-0">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
          />
          <span className="w-10 shrink-0">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Extras */}
      <div className="flex items-center justify-end gap-4 w-1/4 text-gray-400 min-w-[150px] hidden md:flex">

        {onShare && (
          <button onClick={() => onShare(currentTrack)} className="p-1 hover:text-white transition-colors"><ShareIcon fontSize="small" /></button>
        )}
        <div className="relative">
          <button className="p-1 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>
            <MoreVertIcon fontSize="small" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 bottom-full mb-4 w-48 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/10 z-50 py-1 overflow-hidden">
              {onRename && (
                <button onClick={(e) => { e.stopPropagation(); setShowDropdown(false); onRename(currentTrack); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">Rename title</button>
              )}
              {onViewPrompt && (
                <button onClick={(e) => { e.stopPropagation(); setShowDropdown(false); onViewPrompt(currentTrack); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">View song prompt</button>
              )}
              {(onRename || onViewPrompt) && onDelete && (
                <div className="h-px bg-white/10 my-1"></div>
              )}
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); setShowDropdown(false); onDelete(currentTrack.trackId); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors">Delete song</button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 w-32 ml-4 group">
          <button onClick={toggleMute} className="hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white group-hover:accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
