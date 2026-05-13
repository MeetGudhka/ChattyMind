import { Video, Phone, Info, Search, X, ChevronUp, ChevronDown, Menu, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ChatHeader({
  selectedUser,
  isOtherUserTyping,
  onlineUsers,
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  searchQuery,
  setSearchQuery,
  searchResults,
  searchIndex,
  setSearchIndex,
  onMenuOpen,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

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
    if (e.key === 'Enter') { e.shiftKey ? goPrev() : goNext(); }
    if (e.key === 'Escape') closeSearch();
  };

  return (
    <header className="bg-white/[0.03] backdrop-blur-3xl border-b border-white/10 flex flex-col z-20 shadow-sm animate-slideDown shrink-0">
      {/* Main row */}
      <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 gap-2">

        {/* Left: hamburger (mobile) + user info */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuOpen}
            className="md:hidden p-2 rounded-full text-white/65 hover:text-white hover:bg-white/10 transition-all shrink-0"
            aria-label="Open contacts"
          >
            {selectedUser ? <ArrowLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            className={`flex items-center gap-2.5 min-w-0 ${selectedUser ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={() => selectedUser && setIsRightSidebarOpen(!isRightSidebarOpen)}
          >
            {selectedUser && (
              <div className="relative shrink-0">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner ring-1 bg-gradient-to-br from-primary to-secondary ring-white/20">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                {onlineUsers.includes(selectedUser._id) && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a] bg-active shadow-[0_0_8px_#00ffaa]" />
                )}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[15px] md:text-[17px] font-bold text-textPrimary leading-tight truncate">
                  {selectedUser ? selectedUser.username : 'ChattyMind'}
                </h2>
                {selectedUser && onlineUsers.includes(selectedUser._id) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-active shadow-[0_0_4px_#00ffaa] shrink-0" />
                )}
              </div>
              {isOtherUserTyping ? (
                <span className="text-[12px] font-medium text-active animate-pulse">typing...</span>
              ) : selectedUser ? (
                <span className="text-[11px] text-white/55 truncate max-w-[160px] md:max-w-[220px]">
                  {selectedUser.tagline || 'Available'}
                </span>
              ) : (
                <span className="text-[11px] text-white/40">Select a contact to start chatting</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        {selectedUser && (
          <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
            <button
              onClick={() => setIsSearchOpen((v) => !v)}
              className={`p-2 rounded-full transition-all ${isSearchOpen ? 'text-primary bg-white/10' : 'text-white/65 hover:text-primary hover:bg-white/10'}`}
              title="Search messages"
            >
              <Search className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </button>
            <button className="hidden sm:flex p-2 text-white/65 hover:text-primary hover:bg-white/10 rounded-full transition-all" title="Video Call">
              <Video className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </button>
            <button className="hidden sm:flex p-2 text-white/65 hover:text-primary hover:bg-white/10 rounded-full transition-all" title="Voice Call">
              <Phone className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className={`p-2 rounded-full transition-all ${isRightSidebarOpen ? 'text-primary bg-white/10' : 'text-white/65 hover:text-primary hover:bg-white/10'}`}
              title="Contact Info"
            >
              <Info className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Expandable search bar */}
      {isSearchOpen && selectedUser && (
        <div className="px-3 md:px-6 pb-3 flex items-center gap-2 animate-fadeInUp">
          <div className="flex-1 flex items-center gap-2 bg-white/[0.06] border border-white/10 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(0,207,255,0.1)] rounded-2xl px-3 py-2 transition-all duration-300">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search messages…"
              className="bg-transparent outline-none w-full text-white text-[13px] placeholder-white/35"
            />
            {searchQuery.trim() && (
              <span className="text-[11px] text-white/45 font-bold shrink-0 tabular-nums">
                {searchResults.length === 0 ? 'No results' : `${searchIndex + 1}/${searchResults.length}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={goPrev} disabled={searchResults.length === 0} className="p-2 rounded-full text-white/55 hover:text-primary hover:bg-white/10 disabled:opacity-25 transition-all" title="Previous">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button onClick={goNext} disabled={searchResults.length === 0} className="p-2 rounded-full text-white/55 hover:text-primary hover:bg-white/10 disabled:opacity-25 transition-all" title="Next">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button onClick={closeSearch} className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
