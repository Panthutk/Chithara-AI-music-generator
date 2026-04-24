import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StaggeredMenu from '../components/StaggeredMenu';
import AudioPlayer from '../components/AudioPlayer';

// Extracted Components
import TopNavbar from '../components/library/TopNavbar';
import TrackItem from '../components/library/TrackItem';
import LibraryModals from '../components/library/LibraryModals';

const MusicLibrary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [quota, setQuota] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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
  const [deleteModalState, setDeleteModalState] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const showFeedback = (message, isError = false) => {
    setFeedbackMessage({ text: message, isError });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
      if (!e.target.closest('.more-options-container')) {
        setActiveDropdownTrackId(null);
      }
      if (!e.target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteTrack = (trackId) => {
    setDeleteModalState({ type: 'DELETE', trackId });
  };

  const handleRemoveSharedTrack = (trackId) => {
    setDeleteModalState({ type: 'REMOVE_SHARED', trackId });
  };

  const executeDeleteTrack = async () => {
    if (!deleteModalState) return;
    const { trackId, type } = deleteModalState;
    try {
      if (type === 'DELETE') {
        const res = await fetch(`http://localhost:8000/api/tracks/${trackId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'HIDDEN' })
        });
        if (res.ok) {
          setTracks(prev => prev.filter(t => t.trackId !== trackId));
          if (currentTrack?.trackId === trackId) setCurrentTrack(null);
          showFeedback('Track deleted successfully.');
        }
      } else {
        const res = await fetch(`http://localhost:8000/api/tracks/${trackId}/shared/?user_id=${user.userId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setTracks(prev => prev.filter(t => t.trackId !== trackId));
          if (currentTrack?.trackId === trackId) setCurrentTrack(null);
          showFeedback('Shared track removed from library.');
        }
      }
    } catch (e) {
      console.error('Failed to delete/remove track', e);
      showFeedback('An unexpected error occurred.', true);
    } finally {
      setDeleteModalState(null);
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
        showFeedback(errorData.error || 'Failed to share track', true);
      }
    } catch (e) { 
      console.error('Failed to share track', e); 
      showFeedback('An unexpected error occurred.', true);
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

      // Fetch quota
      try {
        const quotaRes = await fetch(`http://localhost:8000/api/user-quota/?user_id=${user.userId}`);
        if (quotaRes.ok) {
          const quotaData = await quotaRes.json();
          if (isMounted) setQuota(quotaData);
        }
      } catch (e) {
        console.error("Failed to fetch quota", e);
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

  const getFilteredAndSortedTracks = () => {
    let result = [...tracks];

    // Filter by title
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => (t.title || 'Untitled Track').toLowerCase().includes(q));
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => b.trackId - a.trackId);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.trackId - b.trackId);
    } else if (sortBy === 'genre') {
      result.sort((a, b) => (a.genre || '').localeCompare(b.genre || ''));
    }

    return result;
  };

  const displayedTracks = getFilteredAndSortedTracks();

  const handlePlayNext = (isShuffling) => {
    if (!currentTrack || displayedTracks.length === 0) return;
    const availableTracks = displayedTracks.filter(t => t.status === 'AVAILABLE');
    
    if (isShuffling && availableTracks.length > 1) {
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      setCurrentTrack(availableTracks[randomIndex]);
      return;
    }

    const currentIndex = availableTracks.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex >= 0 && currentIndex < availableTracks.length - 1) {
      setCurrentTrack(availableTracks[currentIndex + 1]);
    }
  };

  const handlePlayPrev = (isShuffling) => {
    if (!currentTrack || displayedTracks.length === 0) return;
    const availableTracks = displayedTracks.filter(t => t.status === 'AVAILABLE');
    
    if (isShuffling && availableTracks.length > 1) {
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      setCurrentTrack(availableTracks[randomIndex]);
      return;
    }

    const currentIndex = availableTracks.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex > 0) {
      setCurrentTrack(availableTracks[currentIndex - 1]);
    }
  };

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

        // Verify session backend
        fetch('http://localhost:8000/api/auth/verify-session/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
          if (data.valid === false) {
             localStorage.removeItem('chithara_token');
             navigate('/');
          }
        }).catch(console.error);

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
      {/* Top Navbar Component */}
      <TopNavbar
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        quota={quota}
        invites={invites}
        setShowNotifications={setShowNotifications}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        handleLogout={() => {
          localStorage.removeItem('chithara_token');
          navigate('/');
        }}
      />

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
                  <div className="flex items-center text-gray-400 text-sm font-medium relative sort-dropdown-container">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    <div 
                      className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                    >
                      {sortBy === 'newest' ? 'Date (Newest)' : sortBy === 'oldest' ? 'Date (Oldest)' : 'Genre / Type'}
                      <svg className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    {showSortDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                        {['newest', 'oldest', 'genre'].map(option => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option ? 'text-emerald-400 bg-white/5 font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                          >
                            {option === 'newest' ? 'Date (Newest)' : option === 'oldest' ? 'Date (Oldest)' : 'Genre / Type'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {displayedTracks.map(track => (
                    <TrackItem
                      key={track.trackId}
                      track={track}
                      currentTrack={currentTrack}
                      setCurrentTrack={setCurrentTrack}
                      user={user}
                      activeTab={activeTab}
                      activeDropdownTrackId={activeDropdownTrackId}
                      setActiveDropdownTrackId={setActiveDropdownTrackId}
                      handleDownloadTrack={handleDownloadTrack}
                      setShareModalTrack={setShareModalTrack}
                      setShareMode={setShareMode}
                      setEditingTrack={setEditingTrack}
                      setNewTitle={setNewTitle}
                      setViewingPromptTrack={setViewingPromptTrack}
                      handleRemoveSharedTrack={handleRemoveSharedTrack}
                      handleDeleteTrack={handleDeleteTrack}
                    />
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

      {/* Refactored Modals Component */}
      <LibraryModals
        editingTrack={editingTrack}
        setEditingTrack={setEditingTrack}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        handleRenameTrack={handleRenameTrack}
        viewingPromptTrack={viewingPromptTrack}
        setViewingPromptTrack={setViewingPromptTrack}
        shareModalTrack={shareModalTrack}
        setShareModalTrack={setShareModalTrack}
        shareMode={shareMode}
        setShareMode={setShareMode}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        isSendingInvite={isSendingInvite}
        handleShareSubmit={handleShareSubmit}
        showFeedback={showFeedback}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationSearch={notificationSearch}
        setNotificationSearch={setNotificationSearch}
        invites={invites}
        handleRespondInvite={handleRespondInvite}
        deleteModalState={deleteModalState}
        setDeleteModalState={setDeleteModalState}
        executeDeleteTrack={executeDeleteTrack}
      />

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[200]">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${feedbackMessage.isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            <span className="text-sm font-semibold">{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      <AudioPlayer
        currentTrack={currentTrack}
        tracks={displayedTracks.filter(t => t.status === 'AVAILABLE')}
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
