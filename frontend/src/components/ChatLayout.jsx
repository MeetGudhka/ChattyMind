import Sidebar from './Sidebar';
import ChatHeader from './chat/ChatHeader';
import ChatFeed from './chat/ChatFeed';
import AISuggestions from './chat/AISuggestions';
import ChatInput from './chat/ChatInput';
import RightSidebar from './chat/RightSidebar';
import MediaModal from './chat/MediaModal';
import ProfileModal from './chat/ProfileModal';
import SettingsModal from './chat/SettingsModal';
import { Send, Image as ImageIcon, Sparkles, Mic, MessageSquare, Globe, X, Loader2, Check, CheckCheck, Phone, Video, Info, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function ChatLayout({ socket, user: initialUser, setAuth }) {
  const [user, setUser] = useState(initialUser);
  const currentUserId = user?._id || user?.id;
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [tone, setTone] = useState('Professional');
  const [targetScript, setTargetScript] = useState('English Letters');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslatingLanguage, setIsTranslatingLanguage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedMedia, setExpandedMedia] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const aiDebounceRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastFetchedTextRef = useRef('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions, isSuggesting]);

  // Handle Theme Application
  useEffect(() => {
    if (user.settings?.accentColor) {
      const themes = {
        'cyan-purple': { bg: '/ChattyMind-Background.jpg', p: '#00cfff', s: '#a855f7' },
        'gold-sunset': { bg: 'https://images.unsplash.com/photo-1472120482482-d43ba79ff5b0?q=80&w=2070&auto=format&fit=crop', p: '#facc15', s: '#ea580c' },
        'emerald-midnight': { bg: 'https://images.unsplash.com/photo-1534841090574-cbe293998897?q=80&w=2070&auto=format&fit=crop', p: '#34d399', s: '#134e4a' },
        'rose-quartz': { bg: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', p: '#fb7185', s: '#4f46e5' }
      };
      
      const config = themes[user.settings.accentColor] || themes['cyan-purple'];
      
      // Update CSS variables on the root element
      const root = document.documentElement;
      root.style.setProperty('--primary', config.p);
      root.style.setProperty('--secondary', config.s);
      root.style.setProperty('--bg-image', `url(${config.bg})`);
    }
  }, [user.settings?.accentColor]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/unread-counts/${currentUserId}`);
        setUnreadCounts(data);
      } catch (error) {
        console.error("Error fetching unread counts", error);
      }
    };
    if (currentUserId) fetchUnreadCounts();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      const fetchChat = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${currentUserId}/${selectedUser._id}`);
          setChatId(data.chat._id);
          setMessages(data.messages);
          socket.emit('join_chat', data.chat._id);

          // Mark as delivered immediately upon opening (replaces single check with double)
          axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-delivered`, {
            chatId: data.chat._id,
            receiverId: currentUserId
          }).then(() => {
            socket.emit('messages_delivered', { chatId: data.chat._id });
          });

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
        if (user.settings?.readReceipts !== false) {
          axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-seen`, {
            chatId,
            receiverId: currentUserId
          }).then(() => {
            socket.emit('messages_seen', { chatId, receiverId: selectedUser._id });
          });
        }
      } else {
        // Increment unread count for background chat
        setUnreadCounts(prev => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));

        // Mark it delivered
        axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-delivered`, {
          chatId: newMessage.chatId,
          receiverId: currentUserId
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
        setMessages((prev) => prev.map(m => ({ ...m, status: m.senderId === currentUserId ? status : m.status })));
      }
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleMessageDeletedEveryone = ({ messageId }) => {
      setMessages((prev) => prev.map(m => 
        m._id === messageId 
          ? { ...m, isDeletedForEveryone: true, text: 'This message was deleted', mediaUrl: '', mediaType: '' } 
          : m
      ));
    };

    socket.on('receive_message', receiveMessageHandler);
    socket.on('new_message_notification', receiveMessageHandler);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_status_update', handleStatusUpdate);
    socket.on('get_online_users', handleOnlineUsers);
    socket.on('message_deleted_everyone', handleMessageDeletedEveryone);

    // Request initial online users in case the broadcast was missed
    socket.emit('request_online_users');

    // Mark existing unread messages as seen when opening the chat
    if (chatId && selectedUser && user.settings?.readReceipts !== false) {
      axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-seen`, {
        chatId,
        receiverId: currentUserId
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
      socket.off('get_online_users', handleOnlineUsers);
      socket.off('message_deleted_everyone', handleMessageDeletedEveryone);
    };
  }, [socket, chatId, selectedUser, currentUserId]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
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
    if ((!text.trim() && !selectedFile) || !chatId) return;

    let mediaUrl = '';
    let mediaType = '';

    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('media', selectedFile);
      mediaType = selectedFile.type;
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mediaUrl = data.mediaUrl;
      } catch (error) {
        console.error("File upload failed", error);
        alert('Failed to upload file. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const tempId = Date.now().toString();
    const messageData = {
      _id: tempId,
      chatId,
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text: text.trim(),
      mediaUrl,
      mediaType,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    // Optimistic Update
    setMessages((prev) => [...prev, messageData]);
    setText('');
    setSelectedFile(null);
    setSuggestions([]);
    setIsSuggesting(false);
    lastFetchedTextRef.current = '';

    try {
      // Create a copy without the _id for the backend
      const { _id, ...backendData } = messageData;
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/messages/send`, backendData);
      
      // Replace the optimistic message with the real one from the server
      setMessages((prev) => prev.map(m => m._id === tempId ? data : m));
      
      socket.emit('send_message', data);
    } catch (error) {
      console.error("Error saving message", error);
    }
  };

  const handleDeleteMessage = async (messageId, type) => {
    try {
      if (type === 'for_me') {
        setMessages((prev) => prev.filter(m => m._id !== messageId));
      } else if (type === 'for_everyone') {
        setMessages((prev) => prev.map(m => 
          m._id === messageId 
            ? { ...m, isDeletedForEveryone: true, text: 'This message was deleted', mediaUrl: '', mediaType: '' } 
            : m
        ));
      }

      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${messageId}`, {
        data: { type, userId: currentUserId }
      });

      if (type === 'for_everyone') {
        socket.emit('delete_message_everyone', { chatId, messageId });
      }
    } catch (error) {
      console.error("Error deleting message", error);
    }
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar 
        setAuth={setAuth} 
        user={user} 
        onSelectUser={setSelectedUser} 
        unreadCounts={unreadCounts} 
        onlineUsers={onlineUsers}
        onSettings={() => setIsSettingsModalOpen(true)}
      />

      <div className="flex-1 flex relative overflow-hidden">
        {/* Main Chat Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            selectedUser={selectedUser}
            isOtherUserTyping={isOtherUserTyping}
            onlineUsers={onlineUsers}
            isRightSidebarOpen={isRightSidebarOpen}
            setIsRightSidebarOpen={setIsRightSidebarOpen}
          />

          <ChatFeed
            selectedUser={selectedUser}
            messages={messages}
            currentUserId={currentUserId}
            setExpandedMedia={setExpandedMedia}
            messagesEndRef={messagesEndRef}
            handleDeleteMessage={handleDeleteMessage}
          />

          <AISuggestions
            selectedUser={selectedUser}
            text={text}
            isSuggesting={isSuggesting}
            suggestions={suggestions}
            tone={tone}
            setTone={setTone}
            setIsSuggesting={setIsSuggesting}
            fetchSuggestions={fetchSuggestions}
            setText={setText}
            setSuggestions={setSuggestions}
            lastFetchedTextRef={lastFetchedTextRef}
          />

          <ChatInput
            user={user}
            selectedUser={selectedUser}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isUploading={isUploading}
            text={text}
            setText={setText}
            handleTextChange={handleTextChange}
            isRefining={isRefining}
            handleRefine={handleRefine}
            targetScript={targetScript}
            setTargetScript={setTargetScript}
            isTranslating={isTranslating}
            handleTranslate={handleTranslate}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            isTranslatingLanguage={isTranslatingLanguage}
            handleTranslateLanguage={handleTranslateLanguage}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            sendMessage={sendMessage}
          />
        </div>

        <RightSidebar
          isRightSidebarOpen={isRightSidebarOpen}
          selectedUser={selectedUser}
          setIsRightSidebarOpen={setIsRightSidebarOpen}
          messages={messages}
          setExpandedMedia={setExpandedMedia}
        />
      </div>

      <MediaModal
        expandedMedia={expandedMedia}
        setExpandedMedia={setExpandedMedia}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateProfile}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateProfile}
      />
    </div>
  );
}
