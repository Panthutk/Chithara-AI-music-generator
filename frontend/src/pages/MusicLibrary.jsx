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
           
           <button className="ml-4 px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors shrink-0 hidden md:block">
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
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#050505] p-8 md:p-12">
        {/* Content goes here */}
      </main>
      </div>
    </div>
  );
};

export default MusicLibrary;
