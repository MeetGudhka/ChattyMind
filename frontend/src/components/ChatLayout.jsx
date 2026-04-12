import Sidebar from './Sidebar';
import { Send, Image as ImageIcon, Sparkles, Mic, MessageSquare, Globe, X, Loader2, Check, CheckCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function ChatLayout({ socket, user, setAuth }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [tone, setTone] = useState('Professional');
  const [targetScript, setTargetScript] = useState('English Letters');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslatingLanguage, setIsTranslatingLanguage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const aiDebounceRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastFetchedTextRef = useRef('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, isSuggesting]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/unread-counts/${user.id}`);
        setUnreadCounts(data);
      } catch (error) {
        console.error("Error fetching unread counts", error);
      }
    };
    if (user?.id) fetchUnreadCounts();
  }, [user.id]);

  useEffect(() => {
    if (selectedUser) {
      const fetchChat = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${user.id}/${selectedUser._id}`);
          setChatId(data.chat._id);
          setMessages(data.messages);
          socket.emit('join_chat', data.chat._id);
          
          // Reset unread count for this user
          setUnreadCounts(prev => ({ ...prev, [selectedUser._id]: 0 }));
        } catch (error) {
          console.error("Error fetching chat", error);
        }
      };
      fetchChat();
    }
  }, [selectedUser, user.id, socket]);

  useEffect(() => {
    const receiveMessageHandler = (newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages((prev) => {
          if (prev.find(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        
        // If we receive a message and the chat is open, mark it seen
        axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-seen`, {
          chatId,
          receiverId: user.id
        }).then(() => {
          socket.emit('messages_seen', { chatId });
        });
      } else {
        // Increment unread count for background chat
        setUnreadCounts(prev => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));

        // Mark it delivered
        axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-delivered`, {
          chatId: newMessage.chatId,
          receiverId: user.id
        }).then(() => {
          socket.emit('messages_delivered', { chatId: newMessage.chatId });
        });
      }
    };

    const handleTyping = ({ userId }) => {
      if (selectedUser && userId === selectedUser._id) setIsOtherUserTyping(true);
    };

    const handleStopTyping = ({ userId }) => {
      if (selectedUser && userId === selectedUser._id) setIsOtherUserTyping(false);
    };

    const handleStatusUpdate = ({ chatId: incomingChatId, status }) => {
      if (incomingChatId === chatId) {
        setMessages((prev) => prev.map(m => ({ ...m, status: m.senderId === user.id ? status : m.status })));
      }
    };

    socket.on('receive_message', receiveMessageHandler);
    socket.on('new_message_notification', receiveMessageHandler);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_status_update', handleStatusUpdate);

    // Mark existing unread messages as seen when opening the chat
    if (chatId && selectedUser) {
      axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-seen`, {
        chatId,
        receiverId: user.id
      }).then(() => {
        socket.emit('messages_seen', { chatId, receiverId: selectedUser._id });
      });
    }

    return () => {
      socket.off('receive_message', receiveMessageHandler);
      socket.off('new_message_notification', receiveMessageHandler);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_status_update', handleStatusUpdate);
    };
  }, [socket, chatId, selectedUser, user.id]);

  const fetchSuggestions = async (draftText) => {
    try {
      // Gather context (last 3 messages)
      const context = messages.slice(-3).map(m => ({
        sender: m.senderId === user.id ? "User" : "Other",
        text: m.text
      }));

      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/suggest`, {
        text: draftText,
        tone: tone,
        context: context
      });
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Failed to load suggestions", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // AI Suggestion Debounce Logic
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);

    if (newText.trim().length >= 3) {
      if (newText.trim() !== lastFetchedTextRef.current) {
        setSuggestions([]); // Clear only when the semantic text changes
        setIsSuggesting(true);
        aiDebounceRef.current = setTimeout(() => {
          lastFetchedTextRef.current = newText.trim();
          fetchSuggestions(newText.trim());
        }, 3000); // Increased to 3 seconds to heavily reduce API calls
      } else {
        // Just added whitespace (spacebar), keep suggestions visible and don't re-fetch!
        setIsSuggesting(false);
      }
    } else {
      setSuggestions([]); // Clear if less than 3 chars
      setIsSuggesting(false);
    }

    // Typing Indicator Logic
    if (socket && chatId && user && selectedUser) {
      socket.emit('typing', { chatId, userId: user.id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId, userId: user.id });
      }, 1000);
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/translate`, {
        text,
        targetScript: targetScript
      });
      if (data.text) {
        setText(data.text);
        setSuggestions([]); // Clear suggestions so it restarts fresh with translated text
      }
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateLanguage = async () => {
    if (!text.trim()) return;
    setIsTranslatingLanguage(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/translate-language`, {
        text,
        targetLanguage: targetLanguage
      });
      if (data.text) {
        setText(data.text);
        setSuggestions([]); // Clear suggestions so it restarts fresh with translated text
      }
    } catch (error) {
      console.error("Language translation failed", error);
    } finally {
      setIsTranslatingLanguage(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return alert('Speech recognition is not supported in this browser.');
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => prev + (prev.trim() ? ' ' : '') + transcript);
      };

      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (e) => {
        console.error("Speech Recognition Error", e);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleRefine = async (action) => {
    if (!text.trim()) return;
    setIsRefining(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/refine`, {
        text,
        action
      });
      if (data.text) {
        setText(data.text);
        setSuggestions([]); 
      }
    } catch (error) {
      console.error("Refinement failed", error);
    } finally {
      setIsRefining(false);
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !selectedImage) || !chatId) return;

    let mediaUrl = '';

    if (selectedImage) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('media', selectedImage);
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mediaUrl = data.mediaUrl;
      } catch (error) {
        console.error("Image upload failed", error);
        alert('Failed to upload image. Please try again.');
        setIsUploading(false);
        return; // Don't send message if image upload fails
      }
      setIsUploading(false);
    }

    const draftMessage = {
      chatId,
      senderId: user.id,
      receiverId: selectedUser._id,
      text,
      mediaUrl,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    // Optimistic Update
    setMessages((prev) => [...prev, draftMessage]);
    setText('');
    setSelectedImage(null);
    setSuggestions([]);
    setIsSuggesting(false);
    lastFetchedTextRef.current = '';

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/messages/send`, draftMessage);
      // Now broadcast via socket with the real DB object
      socket.emit('send_message', data);
    } catch (error) {
      console.error("Error saving message", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        setAuth={setAuth} 
        user={user} 
        onSelectUser={setSelectedUser} 
        unreadCounts={unreadCounts} 
      />

      <div className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6">
          <div className="flex flex-col">
            <h2 className="text-[17px] font-bold text-gray-800 leading-tight">
              {selectedUser ? selectedUser.username : 'Select a chat'}
            </h2>
            {isOtherUserTyping && (
              <span className="text-[13px] font-medium text-green-500 animate-pulse transition-opacity">typing...</span>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
              <p>Ready to start chatting. AI Suggestions will appear as you type.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm text-[15px] leading-relaxed ${msg.senderId === user.id ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                    {msg.mediaUrl && (
                      <div className="mb-2">
                        <img 
                          src={msg.mediaUrl} 
                          alt="Sent media" 
                          onClick={() => setExpandedImage(msg.mediaUrl)}
                          className="max-h-64 rounded-lg object-contain bg-black/5 cursor-pointer hover:opacity-90 transition-opacity" 
                        />
                      </div>
                    )}
                    {msg.text && <p>{msg.text}</p>}
                    
                    <div className="flex items-center justify-end gap-1 mt-1 -mr-1">
                      <span className={`text-[10px] ${msg.senderId === user.id ? 'text-brand-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.senderId === user.id && (
                        <span className="flex">
                          {msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-white/50" />}
                          {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-white/70" />}
                          {msg.status === 'seen' && <CheckCheck className="w-3.5 h-3.5 text-slate-900" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* {isOtherUserTyping moved to header for WhatsApp look} */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Vertical AI Suggestions Area */}
        {selectedUser && (text.trim().length >= 3) && (isSuggesting || suggestions.length > 0) && (
          <div className="px-6 py-2 shrink-0 relative z-10 w-full">
            <div className="bg-white border border-brand-200 rounded-2xl p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] w-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-brand-600 tracking-wider flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  Smart Suggestions
                </h3>
                {/* Tone Selector */}
                <select
                  value={tone}
                  onChange={(e) => {
                    setTone(e.target.value);
                    if (text.trim()) {
                      setIsSuggesting(true);
                      lastFetchedTextRef.current = text.trim();
                      fetchSuggestions(text.trim());
                    }
                  }}
                  className="text-xs border border-brand-200 rounded-md p-1.5 bg-brand-50 outline-none cursor-pointer text-brand-700 font-semibold hover:border-brand-400 transition-colors"
                >
                  <option value="Casual">Casual</option>
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Expressive">Expressive</option>
                </select>
              </div>

              {isSuggesting && suggestions.length === 0 ? (
                <div className="flex items-center gap-2 p-3 text-brand-500 text-sm font-medium bg-brand-50/50 rounded-lg">
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '75ms' }}></span>
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  Refining text using AI...
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => { setText(sug); setSuggestions([]); setIsSuggesting(false); }}
                      className="w-full text-left bg-white text-sm text-gray-800 p-3 rounded-xl border border-gray-200 shadow-sm hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 transition-all font-medium"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Input Area */}
        <div className="bg-white border-t border-gray-100 p-3 px-6 flex flex-col gap-3 relative z-20 shrink-0 shadow-[0_-5px_20px_-15px_rgba(0,0,0,0.1)]">

          {/* Image Preview */}
          {selectedImage && (
            <div className="flex items-center gap-2 mb-1 p-2 bg-gray-50 rounded-xl border border-gray-200 w-max self-start">
              <div className="relative">
                <img 
                  src={URL.createObjectURL(selectedImage)} 
                  alt="preview" 
                  className="h-16 w-16 object-cover rounded-lg border border-gray-300 shadow-sm"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 shadow-md transition-all hover:scale-105"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-col max-w-[150px] pr-2">
                 <span className="text-xs text-gray-700 font-semibold truncate">{selectedImage.name}</span>
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Ready</span>
              </div>
            </div>
          )}

          {/* AI Tools & Actions Row */}
          <div className="flex items-center w-full gap-3 overflow-x-auto pb-1 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Quick Actions (Shorter, Polite, Clarity) */}
            <div className="flex items-center gap-2 shrink-0 border-r border-gray-200 pr-3">
              {['Shorter', 'Polite', 'Clarity'].map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={!selectedUser || !text.trim() || isRefining}
                  onClick={() => handleRefine(action)}
                  className="text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-full border border-purple-100 transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                >
                  {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                  {action}
                </button>
              ))}
            </div>

            {/* Script & Language Conversion Bars */}
            <div className="flex items-center gap-3 shrink-0">

              {/* Convert Script */}
              <div className="flex items-center gap-1.5 bg-brand-50 px-2 py-1.5 rounded-full border border-brand-100">
                <Globe className="w-3.5 h-3.5 text-brand-400 ml-1" />
                <select
                  value={targetScript}
                  onChange={(e) => setTargetScript(e.target.value)}
                  className="text-xs bg-transparent outline-none cursor-pointer text-brand-700 font-semibold disabled:opacity-50"
                  disabled={!selectedUser}
                >
                  <option value="English Letters">English Letters</option>
                  <option value="Hindi Letters">Hindi Letters</option>
                  <option value="Marathi Letters">Marathi Letters</option>
                  <option value="Gujarati Letters">Gujarati Letters</option>
                </select>
                <button
                  onClick={handleTranslate}
                  type="button"
                  disabled={!selectedUser || !text.trim() || isTranslating}
                  className="text-[11px] bg-brand-600 hover:bg-brand-700 text-white font-bold px-2.5 py-1 rounded-full shadow-sm transition-all disabled:opacity-50 active:scale-95"
                >
                  {isTranslating ? 'Converting...' : 'Auto-Type'}
                </button>
              </div>

              {/* Translate Language */}
              <div className="flex items-center gap-1.5 bg-brand-50 px-2 py-1.5 rounded-full border border-brand-100">
                <Globe className="w-3.5 h-3.5 text-brand-400 ml-1" />
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="text-xs bg-transparent outline-none cursor-pointer text-brand-700 font-semibold disabled:opacity-50"
                  disabled={!selectedUser}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Gujarati">Gujarati</option>
                </select>
                <button
                  onClick={handleTranslateLanguage}
                  type="button"
                  disabled={!selectedUser || !text.trim() || isTranslatingLanguage}
                  className="text-[11px] bg-brand-600 hover:bg-brand-700 text-white font-bold px-2.5 py-1 rounded-full shadow-sm transition-all disabled:opacity-50 active:scale-95"
                >
                  {isTranslatingLanguage ? 'Translating...' : 'Translate'}
                </button>
              </div>

            </div>
          </div>

          {/* Main Integrated Text Input Bar */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1.5 border border-gray-200 focus-within:border-brand-400 focus-within:bg-white focus-within:shadow-[0_0_15px_-5px_rgba(79,70,229,0.3)] transition-all">
            
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />
            
            <button 
              type="button"
              disabled={!selectedUser || isUploading} 
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-brand-600 hover:bg-gray-200 transition-colors p-2.5 rounded-full disabled:opacity-50 shrink-0"
              title="Attach image"
            >
              <ImageIcon className="w-[22px] h-[22px]" />
            </button>
            
            <button 
              type="button"
              disabled={!selectedUser} 
              onClick={toggleRecording}
              className={`text-gray-400 transition-colors p-2.5 rounded-full disabled:opacity-50 shrink-0 relative ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'hover:text-brand-600 hover:bg-gray-200'}`}
              title={isRecording ? "Stop listening" : "Start speaking"}
            >
              {isRecording && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping border border-white"></span>}
              <Mic className="w-[22px] h-[22px]" />
            </button>

            <form className="flex-1 flex items-center h-full mr-1 ml-1" onSubmit={sendMessage}>
              <input
                type="text"
                disabled={!selectedUser || isUploading}
                value={text}
                onChange={handleTextChange}
                placeholder={selectedUser ? "Type a message..." : "Select a contact to chat"}
                className="bg-transparent border-none outline-none w-full text-gray-800 px-2 py-2 placeholder-gray-400 disabled:opacity-50 text-[15px]"
              />

              <button 
                type="submit" 
                disabled={!selectedUser || (!text.trim() && !selectedImage) || isUploading} 
                className="bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 ml-2"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 md:-top-10 right-0 text-white hover:text-gray-300 p-2 z-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(null);
              }}
            >
              <X className="w-8 h-8 drop-shadow-md" />
            </button>
            <img 
              src={expandedImage} 
              alt="Expanded media" 
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
