import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StaggeredMenu from '../components/StaggeredMenu';

const MusicLibrary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  useEffect(() => {
    if (!user || activeTab !== 1) return;
    
    let isMounted = true;

    const fetchTracks = async (showLoading = true) => {
      if (showLoading) setIsLoadingTracks(true);
      try {
        const userId = user.userId;
        const res = await fetch(`http://localhost:8000/api/tracks/?user=${userId}`);
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
           <div className="flex items-center gap-2 mr-4 hidden md:flex text-gray-400">
             <button className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50"><ArrowBackIcon className="w-5 h-5" /></button>
             <button className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50"><ArrowForwardIcon className="w-5 h-5" /></button>
           </div>
           
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
          <button className="p-2 hover:bg-white/10 rounded-full hidden sm:block">
            <NotificationsIcon className="w-5 h-5 text-gray-200" />
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
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#040604] p-8 md:p-12">
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
                  <div key={track.trackId} className="flex items-center justify-between p-3 pr-6 rounded-xl bg-[#141812] hover:bg-[#1f261c] transition-colors group cursor-pointer border border-[#1e261b]">
                    <div className="flex items-center gap-4">
                      <div className="w-[52px] h-[52px] bg-[#222] rounded overflow-hidden shrink-0 flex items-center justify-center">
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
                               <a href={track.audio_url} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 text-white hover:text-emerald-400 transition-all p-1" onClick={(e) => e.stopPropagation()}>
                                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                               </a>
                             )}
                             <span>3:05</span>
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
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-300 mb-2">No tracks generated yet</p>
              <button onClick={() => navigate('/generate')} className="mt-4 px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                Generate Track
              </button>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default MusicLibrary;
