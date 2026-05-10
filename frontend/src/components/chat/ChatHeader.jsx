import { Video, Phone, Info } from 'lucide-react';

export default function ChatHeader({
  selectedUser,
  isOtherUserTyping,
  onlineUsers,
  isRightSidebarOpen,
  setIsRightSidebarOpen
}) {
  return (
    <header className="h-16 bg-white/[0.02] backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-6 z-20 animate-slideDown shadow-sm">
      <div
        className={`flex items-center gap-3 ${selectedUser ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={() => selectedUser && setIsRightSidebarOpen(!isRightSidebarOpen)}
      >
        {selectedUser && (
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner ring-1 bg-gradient-to-br from-primary to-secondary ring-white/20`}>
              {selectedUser.username.charAt(0).toUpperCase()}
            </div>
            {onlineUsers.includes(selectedUser._id) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a] bg-active shadow-[0_0_10px_#00ffaa]"></div>
            )}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-textPrimary leading-tight">
              {selectedUser ? selectedUser.username : 'Select a chat'}
            </h2>
            {selectedUser && onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-active shadow-[0_0_5px_#00ffaa]"></span>
            )}
          </div>
          {isOtherUserTyping ? (
            <span className="text-[13px] font-medium text-active animate-pulse transition-opacity flex items-center gap-1">
              typing...
            </span>
          ) : (
            selectedUser && (
              <span className="text-[12px] text-white/50 truncate max-w-[200px]">
                {selectedUser.tagline || 'Available'}
              </span>
            )
          )}
        </div>
      </div>

      {/* Navbar Buttons */}
      {selectedUser && (
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/60 hover:text-primary hover:bg-white/10 rounded-full transition-all" title="Video Call">
            <Video className="w-[20px] h-[20px]" />
          </button>
          <button className="p-2 text-white/60 hover:text-primary hover:bg-white/10 rounded-full transition-all" title="Voice Call">
            <Phone className="w-[20px] h-[20px]" />
          </button>
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`p-2 rounded-full transition-all ${isRightSidebarOpen ? 'text-primary bg-white/10' : 'text-white/60 hover:text-primary hover:bg-white/10'}`}
            title="Contact Info"
          >
            <Info className="w-[20px] h-[20px]" />
          </button>
        </div>
      )}
    </header>
  );
}
