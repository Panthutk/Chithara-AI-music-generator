import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';

const LibraryModals = ({
  // Rename Modal Props
  editingTrack,
  setEditingTrack,
  newTitle,
  setNewTitle,
  handleRenameTrack,

  // View Prompt Modal Props
  viewingPromptTrack,
  setViewingPromptTrack,

  // Share Modal Props
  shareModalTrack,
  setShareModalTrack,
  shareMode,
  setShareMode,
  inviteEmail,
  setInviteEmail,
  isSendingInvite,
  handleShareSubmit,
  showFeedback,

  // Notifications Modal Props
  showNotifications,
  setShowNotifications,
  notificationSearch,
  setNotificationSearch,
  invites,
  handleRespondInvite,

  // Delete/Remove Modal Props
  deleteModalState,
  setDeleteModalState,
  executeDeleteTrack
}) => {
  return (
    <>
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
                      showFeedback('Link copied to clipboard!');
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

      {/* Delete/Remove Confirmation Modal */}
      {deleteModalState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#141812] border border-[#1e261b] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-3">
              {deleteModalState.type === 'DELETE' ? 'Delete Track' : 'Remove Shared Track'}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {deleteModalState.type === 'DELETE' 
                ? 'Are you sure you want to delete this track? This action cannot be undone.'
                : 'Are you sure you want to remove this track from your shared library?'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteModalState(null)} 
                className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteTrack} 
                className="px-5 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {deleteModalState.type === 'DELETE' ? 'Delete' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LibraryModals;
