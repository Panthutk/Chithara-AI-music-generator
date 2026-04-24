import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StaggeredMenu from '../components/StaggeredMenu';
import AudioPlayer from '../components/AudioPlayer';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DownloadIcon from '@mui/icons-material/Download';

const MusicLibrary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  const [activeDropdownTrackId, setActiveDropdownTrackId] = useState(null);
  const [editingTrack, setEditingTrack] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [viewingPromptTrack, setViewingPromptTrack] = useState(null);

  const [invites, setInvites] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationSearch, setNotificationSearch] = useState('');
  const [shareModalTrack, setShareModalTrack] = useState(null);
  const [shareMode, setShareMode] = useState('PRIVATE');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownTrackId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteTrack = async (trackId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tracks/${trackId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'HIDDEN' })
      });
      if (res.ok) {
        setTracks(prev => prev.filter(t => t.trackId !== trackId));
        if (currentTrack?.trackId === trackId) setCurrentTrack(null);
      }
    } catch (e) {
      console.error('Failed to hide track', e);
    }
  };

  const handleRemoveSharedTrack = async (trackId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tracks/${trackId}/shared/?user_id=${user.userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTracks(prev => prev.filter(t => t.trackId !== trackId));
        if (currentTrack?.trackId === trackId) setCurrentTrack(null);
      }
    } catch (e) {
      console.error('Failed to remove shared track', e);
    }
  };

  const handleRenameTrack = async () => {
    if (!editingTrack || !newTitle.trim()) return;
    try {
      const res = await fetch(`http://localhost:8000/api/tracks/${editingTrack.trackId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      if (res.ok) {
        setTracks(prev => prev.map(t => t.trackId === editingTrack.trackId ? { ...t, title: newTitle.trim() } : t));
        if (currentTrack?.trackId === editingTrack.trackId) {
          setCurrentTrack(prev => ({ ...prev, title: newTitle.trim() }));
        }
        setEditingTrack(null);
        setNewTitle('');
      }
    } catch (e) {
      console.error('Failed to rename track', e);
    }
  };

  const handleRespondInvite = async (inviteId, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/invites/${inviteId}/respond/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.userId, status })
      });
      if (res.ok) {
        setInvites(prev => prev.filter(i => i.inviteId !== inviteId));
        if (status === 'ACCEPTED' && activeTab === 2) {
          // Re-fetch tracks by toggling tab slightly or rely on auto-poll if we add it
          const fetchRes = await fetch(`http://localhost:8000/api/tracks/shared/?user_id=${user.userId}`);
          if (fetchRes.ok) setTracks(await fetchRes.json());
        }
      }
    } catch (e) { console.error('Failed to respond to invite', e); }
  };

  const handleShareSubmit = async () => {
    if (!shareModalTrack) return;
    setIsSendingInvite(true);
    try {
      const payload = { user_id: user.userId };
      if (shareMode === 'INVITE') {
        payload.invite_email = inviteEmail;
      } else {
        payload.visibility = shareMode;
      }
      const res = await fetch(`http://localhost:8000/api/tracks/${shareModalTrack.trackId}/share/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (shareMode !== 'INVITE') {
          setTracks(prev => prev.map(t => t.trackId === shareModalTrack.trackId ? { ...t, visibility: shareMode } : t));
        }
        setShareModalTrack(null);
        setInviteEmail('');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to share track');
      }
    } catch (e) { 
      console.error('Failed to share track', e); 
      alert('An unexpected error occurred.');
    }
    finally { setIsSendingInvite(false); }
  };

  const handleDownloadTrack = async (e, track) => {
    e.stopPropagation();
    try {
      const response = await fetch(track.audio_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${track.title} - ${user.name}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download track', err);
      window.open(track.audio_url, '_blank');
    }
  };

  const handlePlayNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const availableTracks = tracks.filter(t => t.status === 'AVAILABLE');
    const currentIndex = availableTracks.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex >= 0 && currentIndex < availableTracks.length - 1) {
      setCurrentTrack(availableTracks[currentIndex + 1]);
    }
  };

  const handlePlayPrev = () => {
    if (!currentTrack || tracks.length === 0) return;
    const availableTracks = tracks.filter(t => t.status === 'AVAILABLE');
    const currentIndex = availableTracks.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex > 0) {
      setCurrentTrack(availableTracks[currentIndex - 1]);
    }
  };

  useEffect(() => {
    if (!user || (activeTab !== 1 && activeTab !== 2)) return;

    let isMounted = true;

    const fetchTracks = async (showLoading = true) => {
      if (showLoading) setIsLoadingTracks(true);
      try {
        const userId = user.userId;
        const endpoint = activeTab === 2 
          ? `http://localhost:8000/api/tracks/shared/?user_id=${userId}`
          : `http://localhost:8000/api/tracks/?user=${userId}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setTracks(data.results || data || []);
        }
      } catch (e) {
        console.error("Failed to fetch tracks", e);
      } finally {
        if (isMounted) setIsLoadingTracks(false);
      }
    };

    fetchTracks(true);

    const interval = setInterval(() => {
      setTracks(currentTracks => {
        const processing = currentTracks.filter(t => t.status === 'PROCESSING' && t.request_id);
        if (processing.length > 0) {
          processing.forEach(t => {
            fetch(`http://localhost:8000/api/check-generation/?request_id=${t.request_id}`)
              .then(res => res.json())
              .then(data => {
                if (data.status === 'SUCCESS' || data.status === 'FAILED') {
                  fetchTracks(false);
                }
              })
              .catch(console.error);
          });
        }
        return currentTracks;
      });
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    const fetchInvites = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/invites/pending/?user_id=${user.userId}`);
        if (res.ok) {
          const data = await res.json();
          setInvites(data);
        }
      } catch (e) { console.error('Failed to fetch invites', e); }
    };
    fetchInvites();
    const int = setInterval(fetchInvites, 10000);
    return () => clearInterval(int);
  }, [user]);

  useEffect(() => {
    let token = searchParams.get('token');

    if (token) {
      // Save it and clear from URL
      localStorage.setItem('chithara_token', token);
      navigate('/library', { replace: true });
    } else {
      // Try to load existing
      token = localStorage.getItem('chithara_token');
    }

    if (token) {
      try {
        // Decode JWT payload (Header.Payload.Signature)
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = atob(payloadBase64);
        const decodedData = JSON.parse(decodedJson);
        setUser(decodedData);
      } catch (error) {
        console.error("Failed to parse token", error);
        localStorage.removeItem('chithara_token');
        navigate('/');
      }
    } else {
      // Not authenticated
      navigate('/');
    }
  }, [searchParams, navigate]);

  if (!user) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-4 w-1/4">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <MenuIcon className="w-6 h-6 text-gray-200" />
          </button>

          {/* Logo / Brand */}
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight hidden sm:block">Chithara</span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-2xl px-4 flex items-center justify-center">


          <div className="relative w-full max-w-xl group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search songs, albums, artists, podcasts"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <button onClick={() => navigate('/generate')} className="ml-4 px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors shrink-0 hidden md:block">
            Generate Track
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          <button 
            onClick={() => setShowNotifications(true)} 
            className="p-2 hover:bg-white/10 rounded-full hidden sm:block relative"
          >
            <NotificationsIcon className="w-5 h-5 text-gray-200" />
            {invites.length > 0 && (
              <span className="absolute top-1 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {invites.length}
              </span>
            )}
          </button>

          <div className="w-8 h-8 ml-2 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 flex items-center justify-center text-xs font-bold text-black uppercase cursor-pointer shadow-lg">
            {user.name.charAt(0)}
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-4 z-10 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]`}>
          <div className="w-full px-2 flex-1">
            <StaggeredMenu activeId={activeTab} onSelect={setActiveTab} collapsed={isSidebarCollapsed} />
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#040604] p-8 md:p-12 ${currentTrack ? 'pb-32' : ''}`}>
          <div className="max-w-4xl mx-auto">
            {isLoadingTracks ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tracks.length > 0 ? (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center text-gray-400 text-sm font-medium hover:text-white cursor-pointer transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    Sort
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {tracks.map(track => (
                    <div key={track.trackId} onClick={() => track.status === 'AVAILABLE' && setCurrentTrack(track)} className="flex items-center justify-between p-3 pr-6 rounded-xl bg-[#141812] hover:bg-[#1f261c] transition-colors group cursor-pointer border border-[#1e261b]">
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
                            {user.name} · {track.genre || "Unknown"}
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
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/[0.02] mt-10">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  {activeTab === 2 ? (
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  )}
                </div>
                <p className="text-lg font-medium text-gray-300 mb-2">
                  {activeTab === 2 ? "Your shared library is empty" : "No tracks generated yet"}
                </p>
                <p className="text-sm text-gray-500 mb-4 max-w-sm text-center">
                  {activeTab === 2 
                    ? "Invite your friends to share their awesome music with you, or share your own tracks with others!" 
                    : "You haven't generated any tracks yet. Click the button below to get started."}
                </p>
                {activeTab !== 2 && (
                  <button onClick={() => navigate('/generate')} className="mt-4 px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                    Generate Track
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Rename Modal */}
      {editingTrack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141812] border border-[#1e261b] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Rename Track</h2>
            <input 
              type="text" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors mb-6"
              placeholder="Track title"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingTrack(null)} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleRenameTrack} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* View Prompt Modal */}
      {viewingPromptTrack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141812] border border-[#1e261b] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Song Prompt</h2>
            <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6 border border-white/5 max-h-60 overflow-y-auto">
              <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {viewingPromptTrack.prompt || "No prompt available for this track."}
              </p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setViewingPromptTrack(null)} className="px-5 py-2 bg-white hover:bg-gray-200 text-black text-sm font-semibold rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalTrack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141812] border border-[#1e261b] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Share "{shareModalTrack.title}"</h2>
            <p className="text-sm text-gray-400 mb-6">Choose who can listen to this track.</p>
            
            <div className="flex flex-col gap-3 mb-6">
              <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${shareMode === 'PUBLIC' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'}`}>
                <input type="radio" name="shareMode" value="PUBLIC" checked={shareMode === 'PUBLIC'} onChange={() => setShareMode('PUBLIC')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${shareMode === 'PUBLIC' ? 'border-emerald-500' : 'border-gray-500'}`}>
                  {shareMode === 'PUBLIC' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Public</div>
                  <div className="text-xs text-gray-400 mt-0.5">Anyone with the link can listen</div>
                </div>
              </label>

              <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${shareMode === 'PRIVATE' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'}`}>
                <input type="radio" name="shareMode" value="PRIVATE" checked={shareMode === 'PRIVATE'} onChange={() => setShareMode('PRIVATE')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${shareMode === 'PRIVATE' ? 'border-emerald-500' : 'border-gray-500'}`}>
                  {shareMode === 'PRIVATE' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Private</div>
                  <div className="text-xs text-gray-400 mt-0.5">Only you can listen</div>
                </div>
              </label>

              <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${shareMode === 'INVITE' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'}`}>
                <input type="radio" name="shareMode" value="INVITE" checked={shareMode === 'INVITE'} onChange={() => setShareMode('INVITE')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${shareMode === 'INVITE' ? 'border-emerald-500' : 'border-gray-500'}`}>
                  {shareMode === 'INVITE' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Invite via Email</div>
                  <div className="text-xs text-gray-400 mt-0.5">Send a notification to a specific user</div>
                </div>
              </label>
            </div>

            {shareMode === 'INVITE' && (
              <div className="mb-6">
                <input 
                  type="email" 
                  value={inviteEmail} 
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="user@example.com"
                />
              </div>
            )}

            {shareMode === 'PUBLIC' && (
              <div className="mb-6 p-4 rounded-xl bg-[#0a0a0a] border border-white/5">
                <p className="text-xs text-gray-400 mb-2">Public Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/track/${shareModalTrack.trackId}`}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/track/${shareModalTrack.trackId}`);
                      alert('Link copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShareModalTrack(null)} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={handleShareSubmit} 
                disabled={isSendingInvite || (shareMode === 'INVITE' && !inviteEmail.trim())}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingInvite ? 'Processing...' : (shareMode === 'INVITE' ? 'Send Invite' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#141812] border border-[#1e261b] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by inviter name..."
                  value={notificationSearch}
                  onChange={e => setNotificationSearch(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              {invites.filter(invite => 
                (invite.inviter_name || '').toLowerCase().includes(notificationSearch.toLowerCase())
              ).length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm flex flex-col items-center">
                  <NotificationsIcon className="w-12 h-12 text-white/10 mb-3" />
                  {invites.length === 0 ? 'No new notifications' : 'No invites match your search'}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {invites.filter(invite => 
                    (invite.inviter_name || '').toLowerCase().includes(notificationSearch.toLowerCase())
                  ).map(invite => (
                    <div key={invite.inviteId} className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <p className="text-sm text-gray-300 mb-4">
                        <span className="font-bold text-white">{invite.inviter_name || 'Someone'}</span> invited you to listen to <span className="font-bold text-emerald-400">{invite.track_title || 'a track'}</span>.
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => handleRespondInvite(invite.inviteId, 'ACCEPTED')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold py-2 rounded-xl transition-colors">Accept</button>
                        <button onClick={() => handleRespondInvite(invite.inviteId, 'REJECTED')} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 rounded-xl transition-colors">Ignore</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AudioPlayer
        currentTrack={currentTrack}
        tracks={tracks.filter(t => t.status === 'AVAILABLE')}
        onPlayNext={handlePlayNext}
        onPlayPrev={handlePlayPrev}
        onRename={activeTab !== 2 ? (track) => { setEditingTrack(track); setNewTitle(track.title); } : null}
        onViewPrompt={(track) => setViewingPromptTrack(track)}
        onDelete={activeTab !== 2 ? handleDeleteTrack : handleRemoveSharedTrack}
        onShare={activeTab !== 2 ? (track) => { setShareModalTrack(track); setShareMode(track.visibility || 'PRIVATE'); } : null}
      />
    </div>
  );
};

export default MusicLibrary;
