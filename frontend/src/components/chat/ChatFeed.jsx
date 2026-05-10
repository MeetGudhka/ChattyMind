import { useState } from 'react';
import { MessageSquare, FileText, Check, CheckCheck, ChevronDown, Trash2, Ban } from 'lucide-react';

export default function ChatFeed({ selectedUser, messages, currentUserId, setExpandedMedia, messagesEndRef, handleDeleteMessage }) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleMenu = (e, msgId) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === msgId ? null : msgId);
  };

  const closeMenu = () => {
    setActiveMenuId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4" onClick={closeMenu}>
      {!selectedUser ? (
        <div className="flex flex-col items-center justify-center h-full text-textSecondary/70 animate-fadeInUp">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50 animate-float" />
          <p>Ready to start chatting. AI Suggestions will appear as you type.</p>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => (
            <div key={index} className={`flex animate-fadeInUp group ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: `${index * 50}ms` }}>
              <div className="max-w-[75%] md:max-w-[65%] relative">
                
                {/* Message Bubble */}
                <div className={`px-4 py-2.5 text-[15px] leading-relaxed transition-all duration-300 hover:-translate-y-0.5 shadow-md relative ${
                  msg.isDeletedForEveryone 
                  ? 'bg-white/[0.05] border border-white/10 text-white/70 italic rounded-2xl shadow-none'
                  : msg.senderId === currentUserId 
                    ? 'bg-gradient-to-br from-secondary/40 to-secondary/10 text-white border border-secondary/40 rounded-2xl rounded-br-sm hover:from-secondary/50 hover:to-secondary/20 shadow-[0_5px_20px_rgba(168,85,247,0.25)]' 
                    : 'bg-gradient-to-br from-primary/30 to-primary/5 text-white border border-primary/30 rounded-2xl rounded-bl-sm hover:from-primary/40 hover:to-primary/10 shadow-[0_5px_20px_rgba(0,207,255,0.15)]'
                }`}>
                  
                  {/* Context Menu Button */}
                  {!msg.isDeletedForEveryone && (
                    <button 
                      onClick={(e) => toggleMenu(e, msg._id || index)}
                      className={`absolute top-1 ${msg.senderId === currentUserId ? '-left-8' : '-right-8'} p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all z-10 cursor-pointer bg-[#1e293b]/80`}
                    >
                      <ChevronDown className="w-4 h-4 text-white/70" />
                    </button>
                  )}

                  {/* Context Menu Dropdown */}
                  {activeMenuId === (msg._id || index) && (
                    <div 
                      className={`absolute top-0 ${msg.senderId === currentUserId ? 'right-full mr-2' : 'left-full ml-2'} w-48 bg-[#1e293b] border border-white/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[100] animate-fadeInUp origin-top`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { handleDeleteMessage(msg._id, 'for_me'); closeMenu(); }}
                        className="w-full text-left px-4 py-3.5 text-sm text-white/90 hover:bg-white/10 flex items-center gap-3 transition-all cursor-pointer group/item"
                      >
                        <Trash2 className="w-4 h-4 text-white/40 group-hover/item:text-white/70 transition-colors" /> 
                        <span>Delete for me</span>
                      </button>
                      {msg.senderId === currentUserId && (
                        <button
                          onClick={() => { handleDeleteMessage(msg._id, 'for_everyone'); closeMenu(); }}
                          className="w-full text-left px-4 py-3.5 text-sm text-danger hover:bg-white/10 flex items-center gap-3 transition-all border-t border-white/5 whitespace-nowrap cursor-pointer group/item"
                        >
                          <Ban className="w-4 h-4 shrink-0 text-danger/60 group-hover/item:text-danger transition-colors" /> 
                          <span>Delete for everyone</span>
                        </button>
                      )}
                    </div>
                  )}

                  {msg.isDeletedForEveryone ? (
                    <div className="flex items-center gap-2 py-1">
                      <Ban className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="italic text-white/80">This message was deleted</span>
                    </div>
                  ) : (
                    <>
                      {msg.mediaUrl && (
                        <div className="mb-2">
                          {msg.mediaType?.startsWith('video/') || msg.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                            <video
                              src={msg.mediaUrl}
                              controls
                              className="max-h-64 rounded-lg object-contain bg-black/5"
                            />
                          ) : msg.mediaType?.startsWith('image/') || msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || (!msg.mediaType && msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                            <img
                              src={msg.mediaUrl}
                              alt="Sent media"
                              onClick={() => setExpandedMedia(msg.mediaUrl)}
                              className="max-h-64 rounded-lg object-contain bg-black/5 cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <a 
                              href={msg.mediaUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors max-w-xs"
                            >
                              <FileText className="w-6 h-6 shrink-0" />
                              <span className="text-sm font-medium underline truncate">Document</span>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.text && <p>{msg.text}</p>}
                    </>
                  )}

                  <div className={`flex items-center justify-end gap-1 mt-1 -mr-1 ${msg.isDeletedForEveryone ? 'opacity-30' : ''}`}>
                    <span className={`text-[10px] ${msg.senderId === currentUserId ? 'text-white/80' : 'text-white/60'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.senderId === currentUserId && !msg.isDeletedForEveryone && (
                      <span className="flex">
                        {msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-white/50" />}
                        {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-white/70" />}
                        {msg.status === 'seen' && <CheckCheck className="w-3.5 h-3.5 text-active drop-shadow-[0_0_2px_#00ffaa]" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
