import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const TrackItem = ({
  track,
  currentTrack,
  setCurrentTrack,
  user,
  activeTab,
  activeDropdownTrackId,
  setActiveDropdownTrackId,
  handleDownloadTrack,
  setShareModalTrack,
  setShareMode,
  setEditingTrack,
  setNewTitle,
  setViewingPromptTrack,
  handleRemoveSharedTrack,
  handleDeleteTrack
}) => {
  return (
    <div onClick={() => track.status === 'AVAILABLE' && setCurrentTrack(track)} className="flex items-center justify-between p-3 pr-6 rounded-xl bg-[#141812] hover:bg-[#1f261c] transition-colors group cursor-pointer border border-[#1e261b]">
      <div className="flex items-center gap-4">
        <div className="relative w-[52px] h-[52px] bg-[#222] rounded overflow-hidden shrink-0 flex items-center justify-center">
          <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity ${currentTrack?.trackId === track.trackId ? 'bg-black/40' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
            <div className="w-[36px] h-[36px] rounded-full bg-[#a3b899] flex items-center justify-center shadow-md">
              {currentTrack?.trackId === track.trackId ? (
                <VolumeUpIcon className="text-black" fontSize="small" />
              ) : (
                <PlayArrowIcon className="text-black" fontSize="small" />
              )}
            </div>
          </div>
          {track.image_url ? (
            <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 text-xl">🎵</span>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h4 className="font-bold text-gray-100 text-[15px] leading-tight mb-1">
            {track.title || "Untitled Track"}
          </h4>
          <p className="text-[#8c918a] text-[13px] leading-none">
            {user?.name} · {track.genre || "Unknown"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[#8c918a] text-sm">
        {track.status === 'AVAILABLE' ? (
          <div className="flex items-center gap-4">
            {track.audio_url && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-2 text-gray-400 hover:text-white transition-colors flex" 
                  onClick={(e) => handleDownloadTrack(e, track)}
                >
                  <DownloadIcon fontSize="small" />
                </button>
              </div>
            )}
            {activeTab !== 2 && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-2 text-gray-400 hover:text-white transition-colors" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShareModalTrack(track); 
                    setShareMode(track.visibility || 'PRIVATE'); 
                  }}
                >
                  <ShareIcon fontSize="small" />
                </button>
              </div>
            )}
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-white transition-colors" onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveDropdownTrackId(activeDropdownTrackId === track.trackId ? null : track.trackId);
                }}>
                  <MoreVertIcon fontSize="small" />
                </button>
                {activeDropdownTrackId === track.trackId && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/10 z-50 py-1 overflow-hidden">
                    {activeTab !== 2 && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingTrack(track); setNewTitle(track.title); setActiveDropdownTrackId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">Rename title</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setViewingPromptTrack(track); setActiveDropdownTrackId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">View song prompt</button>
                    <div className="h-px bg-white/10 my-1"></div>
                    {activeTab === 2 ? (
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveSharedTrack(track.trackId); setActiveDropdownTrackId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors">Remove from Shared</button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track.trackId); setActiveDropdownTrackId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors">Delete song</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <span className="w-10 text-right group-hover:hidden transition-all">3:05</span>
          </div>
        ) : (
          <span className={`${track.status === 'FAILED' ? 'text-red-400' : 'text-emerald-500 animate-pulse'} text-xs font-bold uppercase tracking-wider`}>
            {track.status}
          </span>
        )}
      </div>
    </div>
  );
};

export default TrackItem;
