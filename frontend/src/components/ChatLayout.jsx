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
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // ─── In-chat message search ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const aiDebounceRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastFetchedTextRef = useRef('');

  // ─── Send-once guard ─────────────────────────────────────────────────────
  // isSendingRef prevents double-sends from form submit + button click
  // or React StrictMode double-invocation.
  const isSendingRef = useRef(false);

  // ─── Deduplication set ───────────────────────────────────────────────────
  // Tracks every message id (tempId or real _id) we have already rendered.
  // Reset when switching chats (inside fetchChat).
  const processedMessagesRef = useRef(new Set());

  const [firstUnseenId, setFirstUnseenId] = useState(null);
  const firstUnseenRef = useRef(null);

  // ── Scroll to first unseen on load, then to bottom on new messages ────────
  useEffect(() => {
    if (firstUnseenId && firstUnseenRef.current) {
      firstUnseenRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFirstUnseenId(null);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, suggestions, isSuggesting, firstUnseenId]);

  // ── Theme application ─────────────────────────────────────────────────────
  useEffect(() => {
    if (user.settings?.accentColor) {
      const themes = {
        'cyan-purple': { bg: '/ChattyMind-Background.jpg', p: '#00cfff', s: '#a855f7' },
        'gold-sunset': { bg: 'https://images.unsplash.com/photo-1472120482482-d43ba79ff5b0?q=80&w=2070&auto=format&fit=crop', p: '#facc15', s: '#ea580c' },
        'emerald-midnight': { bg: 'https://images.unsplash.com/photo-1534841090574-cbe293998897?q=80&w=2070&auto=format&fit=crop', p: '#34d399', s: '#134e4a' },
        'rose-quartz': { bg: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', p: '#fb7185', s: '#4f46e5' }
      };
      const config = themes[user.settings.accentColor] || themes['cyan-purple'];
      const root = document.documentElement;
      root.style.setProperty('--primary', config.p);
      root.style.setProperty('--secondary', config.s);
      root.style.setProperty('--bg-image', `url(${config.bg})`);
    }
  }, [user.settings?.accentColor]);

  // ── Fetch initial unread counts ───────────────────────────────────────────
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/unread-counts/${currentUserId}`);
        setUnreadCounts(data);
      } catch (error) {
        console.error('Error fetching unread counts', error);
      }
    };
    if (currentUserId) fetchUnreadCounts();
  }, [currentUserId]);

  // ── Load chat when a user is selected ────────────────────────────────────
  useEffect(() => {
    if (!selectedUser) return;

    const fetchChat = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/messages/${currentUserId}/${selectedUser._id}`
        );

        setChatId(data.chat._id);
        setMessages(data.messages);

        // ── Prime the dedup set with messages already in DB ──────────────
        processedMessagesRef.current = new Set();
        data.messages.forEach(m => {
          if (m._id) processedMessagesRef.current.add(m._id.toString());
          if (m.tempId) processedMessagesRef.current.add(m.tempId);
        });

        // Find first unseen message from the other user for scroll-to
        const firstUnseen = data.messages.find(
          m => m.senderId?.toString() === selectedUser._id && m.status !== 'seen'
        );
        setFirstUnseenId(firstUnseen ? firstUnseen._id : null);

        // Join the shared chatId room (for typing indicators, delete events, status)
        socket.emit('join_chat', data.chat._id);

        // Mark messages as delivered for this user
        axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-delivered`, {
          chatId: data.chat._id,
          receiverId: currentUserId
        }).then(() => {
          // Notify the sender (pass senderId so server can target their personal room)
          socket.emit('messages_delivered', {
            chatId: data.chat._id,
            senderId: selectedUser._id  // the person who sent those messages
          });
        });

        // Reset unread badge for this contact
        setUnreadCounts(prev => ({ ...prev, [selectedUser._id]: 0 }));
      } catch (error) {
        console.error('Error fetching chat', error);
      }
    };

    fetchChat();
  }, [selectedUser, currentUserId, socket]);

  // ── Socket event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    // ── receive_message ───────────────────────────────────────────────────
    const receiveMessageHandler = (newMessage) => {
      // Deduplication: use tempId first, then real _id
      const dedupeKey = newMessage.tempId || newMessage._id?.toString();
      if (!dedupeKey) return;
      if (processedMessagesRef.current.has(dedupeKey)) return;

      // Also check by real _id if present
      if (newMessage._id && processedMessagesRef.current.has(newMessage._id.toString())) return;

      // Mark both ids as processed
      processedMessagesRef.current.add(dedupeKey);
      if (newMessage._id) processedMessagesRef.current.add(newMessage._id.toString());

      // ── Message for the currently open chat ────────────────────────────
      if (newMessage.chatId?.toString() === chatId?.toString()) {
        setMessages(prev => {
          // State-level safety net: reject if any existing message shares an id
          const alreadyExists = prev.some(m =>
            (m._id && newMessage._id && m._id.toString() === newMessage._id.toString()) ||
            (m.tempId && newMessage.tempId && m.tempId === newMessage.tempId)
          );
          if (alreadyExists) return prev;
          return [...prev, newMessage];
        });

        // Always call mark-seen so isFirstSeen=true clears the unread badge.
        // The server checks the receiver's readReceipts setting and only updates
        // message status to 'seen' if it is enabled.
        axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-seen`, {
          chatId,
          receiverId: currentUserId
        }).then(() => {
          // Only emit 'messages_seen' if read receipts are ON.
          // This is what makes the sender's tick turn green — skip it when OFF
          // so the sender only ever sees the gray double-tick (delivered).
          if (user.settings?.readReceipts !== false) {
            socket.emit('messages_seen', {
              chatId,
              senderId: newMessage.senderId
            });
          }
        });
      } else {
        // ── Background chat: increment unread badge ────────────────────
        setUnreadCounts(prev => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));

        // Mark as delivered in the background
        axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-delivered`, {
          chatId: newMessage.chatId,
          receiverId: currentUserId
        }).then(() => {
          socket.emit('messages_delivered', {
            chatId: newMessage.chatId,
            senderId: newMessage.senderId
          });
        });
      }
    };

    // ── typing ────────────────────────────────────────────────────────────
    const handleTyping = ({ userId }) => {
      if (selectedUser && userId === selectedUser._id) setIsOtherUserTyping(true);
    };

    const handleStopTyping = ({ userId }) => {
      if (selectedUser && userId === selectedUser._id) setIsOtherUserTyping(false);
    };

    // ── message_status_update ─────────────────────────────────────────────
    const handleStatusUpdate = ({ chatId: incomingChatId, status }) => {
      if (incomingChatId?.toString() === chatId?.toString()) {
        setMessages(prev =>
          prev.map(m => ({
            ...m,
            status: m.senderId?.toString() === currentUserId ? status : m.status
          }))
        );
      }
    };

    // ── online users ──────────────────────────────────────────────────────
    const handleOnlineUsers = (users) => setOnlineUsers(users);

    // ── message deleted for everyone ──────────────────────────────────────
    const handleMessageDeletedEveryone = ({ messageId }) => {
      setMessages(prev =>
        prev.map(m =>
          m._id === messageId
            ? { ...m, isDeletedForEveryone: true, text: 'This message was deleted', mediaUrl: '', mediaType: '' }
            : m
        )
      );
    };

    // Remove ALL previous listeners before re-registering (prevents stacking)
    socket.off('receive_message');
    socket.off('typing');
    socket.off('stop_typing');
    socket.off('message_status_update');
    socket.off('get_online_users');
    socket.off('message_deleted_everyone');

    socket.on('receive_message', receiveMessageHandler);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_status_update', handleStatusUpdate);
    socket.on('get_online_users', handleOnlineUsers);
    socket.on('message_deleted_everyone', handleMessageDeletedEveryone);

    // Request current online list in case we missed the broadcast
    socket.emit('request_online_users');

    // Always call mark-seen when opening a chat so isFirstSeen=true clears the
    // unread badge — regardless of the receiver's readReceipts setting.
    // The server handles the status='seen' update only if readReceipts is ON.
    if (chatId && selectedUser) {
      axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/messages/mark-seen`, {
        chatId,
        receiverId: currentUserId
      }).then(() => {
        // Only notify the sender (green tick) if read receipts are enabled
        if (user.settings?.readReceipts !== false) {
          socket.emit('messages_seen', {
            chatId,
            senderId: selectedUser._id
          });
        }
      });
    }

    return () => {
      socket.off('receive_message', receiveMessageHandler);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_status_update', handleStatusUpdate);
      socket.off('get_online_users', handleOnlineUsers);
      socket.off('message_deleted_everyone', handleMessageDeletedEveryone);
    };
  }, [socket, chatId, selectedUser, currentUserId]);

  // ── AI Suggestions ────────────────────────────────────────────────────────
  const fetchSuggestions = async (draftText) => {
    try {
      const context = messages.slice(-3).map(m => ({
        sender: m.senderId === user.id ? 'User' : 'Other',
        text: m.text
      }));
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/suggest`, {
        text: draftText,
        tone,
        context
      });
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);

    if (newText.trim().length >= 3) {
      if (newText.trim() !== lastFetchedTextRef.current) {
        setSuggestions([]);
        setIsSuggesting(true);
        aiDebounceRef.current = setTimeout(() => {
          lastFetchedTextRef.current = newText.trim();
          fetchSuggestions(newText.trim());
        }, 3000);
      } else {
        setIsSuggesting(false);
      }
    } else {
      setSuggestions([]);
      setIsSuggesting(false);
    }

    // Typing indicator
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
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/translate`, { text, targetScript });
      if (data.text) { setText(data.text); setSuggestions([]); }
    } catch (error) {
      console.error('Translation failed', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateLanguage = async () => {
    if (!text.trim()) return;
    setIsTranslatingLanguage(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/translate-language`, { text, targetLanguage });
      if (data.text) { setText(data.text); setSuggestions([]); }
    } catch (error) {
      console.error('Language translation failed', error);
    } finally {
      setIsTranslatingLanguage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition is not supported in this browser.');

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => prev + (prev.trim() ? ' ' : '') + transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (e) => { console.error('Speech Recognition Error', e); setIsRecording(false); };
      recognitionRef.current = recognition;
    }

    if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); }
    else { recognitionRef.current.start(); setIsRecording(true); }
  };

  const handleRefine = async (action) => {
    if (!text.trim()) return;
    setIsRefining(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/refine`, { text, action });
      if (data.text) { setText(data.text); setSuggestions([]); }
    } catch (error) {
      console.error('Refinement failed', error);
    } finally {
      setIsRefining(false);
    }
  };

  // ── sendMessage ───────────────────────────────────────────────────────────
  // Guarded at the very top to prevent any double-send scenario.
  const sendMessage = async (e) => {
    if (e) e.preventDefault();

    // ── Guard 1: Nothing to send ─────────────────────────────────────────
    if ((!text.trim() && !selectedFile) || !chatId) return;

    // ── Guard 2: Already sending (blocks double-submit / StrictMode calls)
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    let mediaUrl = '';
    let mediaType = '';

    // ── Upload file if attached ──────────────────────────────────────────
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
        console.error('File upload failed', error);
        alert('Failed to upload file. Please try again.');
        setIsUploading(false);
        isSendingRef.current = false;
        return;
      }
      setIsUploading(false);
    }

    // ── Build tempId for optimistic UI and DB deduplication ─────────────
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // The object sent to the server — NO _id field (server assigns real ObjectId)
    const messagePayload = {
      tempId,
      chatId,
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text: text.trim(),
      mediaUrl,
      mediaType,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    // ── Optimistic update — show message instantly in sender's UI ────────
    // Use tempId as the local _id placeholder only for rendering
    const optimisticMessage = { ...messagePayload, _id: tempId };
    processedMessagesRef.current.add(tempId);
    setMessages(prev => [...prev, optimisticMessage]);

    // Clear input immediately for a snappy UX
    setText('');
    setSelectedFile(null);
    setSuggestions([]);
    setIsSuggesting(false);
    lastFetchedTextRef.current = '';

    try {
      // ── Persist to DB via HTTP POST (atomic upsert on tempId) ──────────
      const { data: savedMessage } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/send`,
        messagePayload
      );

      // Mark real DB _id as processed so any echoed socket event is ignored
      if (savedMessage._id) {
        processedMessagesRef.current.add(savedMessage._id.toString());
      }

      // Replace optimistic entry with the confirmed DB record (keeps tempId for keying)
      setMessages(prev =>
        prev.map(m => m.tempId === tempId ? { ...savedMessage, tempId } : m)
      );

      // ── Notify receiver via socket ─────────────────────────────────────
      // The server will relay this ONLY to receiverId's personal room.
      // We do NOT rely on the chatId room to avoid the message bouncing
      // back to the sender's own receive_message handler.
      socket.emit('send_message', { ...savedMessage, tempId });

    } catch (error) {
      console.error('Error saving message', error);
      // Roll back the optimistic message on failure
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
      processedMessagesRef.current.delete(tempId);
    } finally {
      isSendingRef.current = false;
    }
  };

  // ── Delete message ────────────────────────────────────────────────────────
  const handleDeleteMessage = async (messageId, type) => {
    try {
      if (type === 'for_me') {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      } else if (type === 'for_everyone') {
        setMessages(prev =>
          prev.map(m =>
            m._id === messageId
              ? { ...m, isDeletedForEveryone: true, text: 'This message was deleted', mediaUrl: '', mediaType: '' }
              : m
          )
        );
      }

      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${messageId}`, {
        data: { type, userId: currentUserId }
      });

      if (type === 'for_everyone') {
        socket.emit('delete_message_everyone', { chatId, messageId });
      }
    } catch (error) {
      console.error('Error deleting message', error);
    }
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <Sidebar
        setAuth={setAuth}
        user={user}
        onSelectUser={setSelectedUser}
        unreadCounts={unreadCounts}
        onlineUsers={onlineUsers}
        onSettings={() => setIsSettingsModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
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
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            searchIndex={searchIndex}
            setSearchIndex={setSearchIndex}
            onMenuOpen={() => setIsSidebarOpen(true)}
          />

          <ChatFeed
            selectedUser={selectedUser}
            messages={messages}
            currentUserId={currentUserId}
            setExpandedMedia={setExpandedMedia}
            messagesEndRef={messagesEndRef}
            handleDeleteMessage={handleDeleteMessage}
            firstUnseenId={firstUnseenId}
            firstUnseenRef={firstUnseenRef}
            searchQuery={searchQuery}
            searchResults={searchResults}
            searchIndex={searchIndex}
            onSearchResults={setSearchResults}
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
