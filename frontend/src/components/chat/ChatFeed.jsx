import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, FileText, Check, CheckCheck, ChevronDown, Trash2, Ban } from 'lucide-react';

// Splits `text` into parts, wrapping matches with a highlight span
function HighlightedText({ text, query }) {
  if (!query || !query.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-400 text-black rounded-sm px-0.5 font-semibold shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ChatFeed({
  selectedUser,
  messages,
  currentUserId,
  setExpandedMedia,
  messagesEndRef,
  handleDeleteMessage,
  firstUnseenId,
  firstUnseenRef,
  // Search props
  searchQuery,
  searchResults,
  searchIndex,
  onSearchResults,   // callback to push result ids up to ChatLayout
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const activeResultRef = useRef(null);

  const toggleMenu = (e, msgId) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === msgId ? null : msgId);
  };
  const closeMenu = () => setActiveMenuId(null);

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // ── Compute search results whenever query or messages change ──────────────
  useEffect(() => {
    if (!searchQuery?.trim()) {
      onSearchResults?.([]);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const matched = messages
      .filter(m => m.text && m.text.toLowerCase().includes(q) && !m.isDeletedForEveryone)
      .map(m => m._id || m.tempId);
    onSearchResults?.(matched);
  }, [searchQuery, messages]);

  // ── Scroll active result into view ────────────────────────────────────────
  useEffect(() => {
    if (activeResultRef.current) {
      activeResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchIndex, searchResults]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4" onClick={closeMenu}>
      {!selectedUser ? (
        <div className="flex flex-col items-center justify-center h-full text-textSecondary/70 animate-fadeInUp">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50 animate-float" />
          <p>Ready to start chatting. AI Suggestions will appear as you type.</p>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = messages[index - 1];
            const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;

            const msgDate = new Date(msg.createdAt).toDateString();
            const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
            const showDateSeparator = msgDate !== prevMsgDate;

            const isFirstUnseen = msg._id === firstUnseenId;

            // ── Search match state ──────────────────────────────────────────
            const msgKey = msg._id || msg.tempId;
            const matchIdx = searchResults?.indexOf(msgKey);
            const isSearchMatch = matchIdx !== undefined && matchIdx !== -1;
            const isActiveResult = isSearchMatch && matchIdx === searchIndex;

            return (
              <div
                key={msgKey || index}
                className="flex flex-col"
                ref={
                  isFirstUnseen
                    ? firstUnseenRef
                    : isActiveResult
                    ? activeResultRef
                    : null
                }
              >
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-8 animate-fadeInUp">
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <span className="mx-6 text-[12px] font-black text-white/80 uppercase tracking-[0.25em] bg-white/[0.08] px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl shadow-premium">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/10" />
                  </div>
                )}

                <div
                  className={`flex animate-fadeInUp group ${isMe ? 'justify-end' : 'justify-start'} ${isSameSender ? '-mt-1' : 'mt-3'}`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className={`max-w-[80%] md:max-w-[70%] relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>

                    {/* Sender Name (only for first in group) */}
                    {!isMe && !isSameSender && selectedUser && (
                      <span className="text-[10px] font-bold text-white/60 ml-1 mb-1 tracking-[0.15em] uppercase">
                        {selectedUser.username}
                      </span>
                    )}

                    {/* Message Bubble */}
                    <div className={`px-4 py-3 text-[15px] leading-relaxed transition-all duration-300 relative rounded-xl backdrop-blur-[8px] ${
                      // Active search result: glow ring
                      isActiveResult
                        ? 'ring-2 ring-primary shadow-[0_0_24px_rgba(0,207,255,0.45)]'
                        : isSearchMatch
                        ? 'ring-1 ring-primary/30'
                        : ''
                    } ${
                      msg.isDeletedForEveryone
                        ? 'bg-white/[0.06] border border-dashed border-white/20 text-white/50 italic shadow-inner-light'
                        : isMe
                          ? 'bg-[rgba(76,29,149,0.4)] text-white border border-secondary/40 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:bg-[rgba(76,29,149,0.5)]'
                          : 'bg-[rgba(30,41,59,0.7)] text-white border border-primary/40 shadow-[0_0_20px_rgba(0,207,255,0.2)] hover:bg-[rgba(30,41,59,0.8)]'
                    }`}>

                      {/* Context Menu Button */}
                      {!msg.isDeletedForEveryone && (
                        <button
                          onClick={(e) => toggleMenu(e, msgKey || index)}
                          className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-10' : '-right-10'} p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all z-10 cursor-pointer bg-white/5 border border-white/5 backdrop-blur-md`}
                        >
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        </button>
                      )}

                      {/* Context Menu Dropdown */}
                      {activeMenuId === (msgKey || index) && (
                        <div
                          className={`absolute top-0 ${isMe ? 'right-full mr-3' : 'left-full ml-3'} w-48 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-premium overflow-hidden z-[100] animate-fadeInUp origin-top`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => { handleDeleteMessage(msg._id, 'for_me'); closeMenu(); }}
                            className="w-full text-left px-4 py-3 text-sm text-white/70 hover:bg-white/5 flex items-center gap-3 transition-all cursor-pointer group/item"
                          >
                            <Trash2 className="w-4 h-4 text-white/20 group-hover/item:text-white/50 transition-colors" />
                            <span className="font-medium">Delete for me</span>
                          </button>
                          {isMe && (
                            <button
                              onClick={() => { handleDeleteMessage(msg._id, 'for_everyone'); closeMenu(); }}
                              className="w-full text-left px-4 py-3 text-sm text-danger/70 hover:bg-danger/5 flex items-center gap-3 transition-all border-t border-white/5 whitespace-nowrap cursor-pointer group/item"
                            >
                              <Ban className="w-4 h-4 shrink-0 text-danger/30 group-hover/item:text-danger/60 transition-colors" />
                              <span className="font-semibold text-danger/80">Delete for everyone</span>
                            </button>
                          )}
                        </div>
                      )}

                      {msg.isDeletedForEveryone ? (
                        <div className="flex items-center gap-3 py-1 px-1 text-white/60">
                          <Ban className="w-4 h-4 opacity-70 shrink-0" />
                          <span className="text-[14px] font-bold tracking-tight">This message was deleted</span>
                        </div>
                      ) : (
                        <>
                          {msg.mediaUrl && (
                            <div className="mb-2 relative group/media overflow-hidden rounded-lg border border-white/10 shadow-inner-light">
                              {msg.mediaType?.startsWith('video/') || msg.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                <video src={msg.mediaUrl} controls className="max-h-80 w-full rounded-lg object-contain bg-black/40" />
                              ) : msg.mediaType?.startsWith('image/') || msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || (!msg.mediaType && msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                <img
                                  src={msg.mediaUrl}
                                  alt="Sent media"
                                  onClick={() => setExpandedMedia(msg.mediaUrl)}
                                  className="max-h-80 w-full rounded-lg object-contain bg-black/40 cursor-pointer hover:scale-[1.02] transition-all duration-500"
                                />
                              ) : (
                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10">
                                  <div className="p-2 bg-primary/20 rounded-lg text-primary shadow-[0_0_15px_rgba(0,207,255,0.3)]">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold truncate tracking-wide">Document</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">View Archive</span>
                                  </div>
                                </a>
                              )}
                            </div>
                          )}
                          {msg.text && (
                            <p className="relative z-10 leading-[1.6]">
                              <HighlightedText text={msg.text} query={searchQuery} />
                            </p>
                          )}
                        </>
                      )}

                      <div className={`flex items-center justify-end gap-1.5 mt-1.5 -mb-0.5 opacity-70 ${msg.isDeletedForEveryone ? 'opacity-20' : ''}`}>
                        <span className="text-[11px] font-bold tracking-tight">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && !msg.isDeletedForEveryone && (
                          <span className="flex">
                            {msg.status === 'sent' && <Check className="w-4 h-4" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-4 h-4" />}
                            {msg.status === 'seen' && <CheckCheck className="w-4 h-4 text-[#00ffaa] drop-shadow-[0_0_8px_rgba(0,255,170,0.6)]" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
