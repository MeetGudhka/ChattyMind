import { Video, Phone, Info, Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ChatHeader({
  selectedUser,
  isOtherUserTyping,
  onlineUsers,
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  // Search props passed from ChatLayout
  searchQuery,
  setSearchQuery,
  searchResults,
  searchIndex,
  setSearchIndex,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Focus input when search bar opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const goNext = () => {
    if (!searchResults.length) return;
    setSearchIndex((prev) => (prev + 1) % searchResults.length);
  };

  const goPrev = () => {
    if (!searchResults.length) return;
    setSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.shiftKey ? goPrev() : goNext();
    }
    if (e.key === 'Escape') closeSearch();
  };

  return (
    <header className="bg-white/[0.02] backdrop-blur-3xl border-b border-white/10 flex flex-col z-20 shadow-sm animate-slideDown">
      {/* Main header row */}
      <div className="h-16 flex items-center justify-between px-6">
        {/* Left: user info */}
        <div
          className={`flex items-center gap-3 ${selectedUser ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={() => selectedUser && setIsRightSidebarOpen(!isRightSidebarOpen)}
        >
          {selectedUser && (
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner ring-1 bg-gradient-to-br from-primary to-secondary ring-white/20">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              {onlineUsers.includes(selectedUser._id) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a] bg-active shadow-[0_0_10px_#00ffaa]" />
              )}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-textPrimary leading-tight">
                {selectedUser ? selectedUser.username : 'Select a chat'}
              </h2>
              {selectedUser && onlineUsers.includes(selectedUser._id) && (
                <span className="w-2 h-2 rounded-full bg-active shadow-[0_0_5px_#00ffaa]" />
              )}
            </div>
            {isOtherUserTyping ? (
              <span className="text-[13px] font-medium text-active animate-pulse flex items-center gap-1">
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

        {/* Right: action buttons */}
        {selectedUser && (
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setIsSearchOpen((v) => !v)}
              className={`p-2 rounded-full transition-all ${isSearchOpen ? 'text-primary bg-white/10' : 'text-white/60 hover:text-primary hover:bg-white/10'}`}
              title="Search messages"
            >
              <Search className="w-[20px] h-[20px]" />
            </button>

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
      </div>

      {/* Expandable search bar */}
      {isSearchOpen && selectedUser && (
        <div className="px-6 pb-3 flex items-center gap-3 animate-fadeInUp">
          <div className="flex-1 flex items-center gap-3 bg-white/[0.06] border border-white/10 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(0,207,255,0.1)] rounded-2xl px-4 py-2.5 transition-all duration-300">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search messages…"
              className="bg-transparent outline-none w-full text-white text-[14px] placeholder-white/30"
            />
            {/* Result counter */}
            {searchQuery.trim() && (
              <span className="text-[12px] text-white/40 font-bold shrink-0 tabular-nums">
                {searchResults.length === 0
                  ? 'No results'
                  : `${searchIndex + 1} / ${searchResults.length}`}
              </span>
            )}
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              disabled={searchResults.length === 0}
              className="p-2 rounded-full text-white/50 hover:text-primary hover:bg-white/10 disabled:opacity-20 transition-all"
              title="Previous result (Shift+Enter)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              disabled={searchResults.length === 0}
              className="p-2 rounded-full text-white/50 hover:text-primary hover:bg-white/10 disabled:opacity-20 transition-all"
              title="Next result (Enter)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={closeSearch}
            className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
