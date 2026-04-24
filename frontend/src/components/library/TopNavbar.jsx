import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({
  user,
  searchQuery,
  setSearchQuery,
  quota,
  invites,
  setShowNotifications,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  showProfileDropdown,
  setShowProfileDropdown,
  handleLogout
}) => {
  const navigate = useNavigate();

  return (
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs by track title..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 hidden md:flex ml-4">
          {quota && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {quota.remaining} Coins
            </div>
          )}
          <button onClick={() => navigate('/generate')} className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors">
            Generate Track
          </button>
        </div>
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

        <div className="relative profile-dropdown-container">
          <div 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-8 h-8 ml-2 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 flex items-center justify-center text-xs font-bold text-black uppercase cursor-pointer shadow-lg"
          >
            {user?.name?.charAt(0)}
          </div>
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-white/10 mb-1">
                Logged in as <span className="font-semibold text-white">{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
