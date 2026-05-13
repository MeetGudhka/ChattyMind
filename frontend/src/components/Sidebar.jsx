import { useEffect, useState } from 'react';
import { Search, MessageSquare, Settings, LogOut, X } from 'lucide-react';
import axios from 'axios';

export default function Sidebar({ setAuth, user, onSelectUser, unreadCounts = {}, onlineUsers = [], onSettings, isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUserId = user._id || user.id;
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users?currentUserId=${currentUserId}`);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    if (user?._id || user?.id) fetchUsers();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (u) => {
    onSelectUser(u);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        w-72 md:w-64
        bg-[#080817]/95 md:bg-white/[0.02]
        backdrop-blur-3xl border-r border-white/10
        h-full flex flex-col shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-[8px_0_40px_rgba(0,0,0,0.5)]' : '-translate-x-full'}
        md:translate-x-0 md:shadow-none
      `}>
        {/* Header */}
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            <MessageSquare className="w-6 h-6 text-primary animate-float shrink-0" />
            ChattyMind
          </h1>
          <button onClick={onClose} className="md:hidden p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.09] focus:border-primary/50 focus:bg-white/[0.08] rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
          <h2 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] mb-3 ml-2">
            {searchTerm ? 'Search Results' : 'Contacts'}
          </h2>
          {filteredUsers.length === 0 && (
            <p className="text-center py-8 text-white/30 text-sm">No contacts found</p>
          )}
          {filteredUsers.map((u, index) => {
            const isOnline = onlineUsers.includes(u._id);
            return (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="flex items-center justify-between p-3 bg-white/[0.02] rounded-[20px] cursor-pointer transition-all duration-300 border border-transparent hover:bg-white/[0.07] hover:border-white/10 hover:shadow-premium group relative overflow-hidden animate-slideInLeft"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px]" />
                <div className="flex items-center gap-3 min-w-0 relative z-10">
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-premium ring-1 transition-all duration-300 ${isOnline ? 'bg-gradient-to-br from-primary to-secondary ring-white/15 group-hover:scale-105 text-white' : 'bg-white/[0.07] ring-white/[0.07] text-white/60'}`}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#080817] transition-all ${isOnline ? 'bg-active shadow-[0_0_8px_rgba(0,255,170,0.6)] animate-pulse' : 'bg-white/15'}`} />
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold truncate transition-all ${isOnline ? 'text-white group-hover:text-primary' : 'text-white/55 group-hover:text-white/75'}`}>
                      {u.username}
                    </p>
                    <p className={`text-[11px] font-medium mt-0.5 ${isOnline ? 'text-active/75' : 'text-white/35'}`}>
                      {isOnline ? '● Active now' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                {unreadCounts[u._id] > 0 && (
                  <div className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-glow animate-bounceDelay relative z-10 shrink-0 ml-2">
                    {unreadCounts[u._id] > 99 ? '99+' : unreadCounts[u._id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] flex flex-col gap-2 bg-white/[0.02] shrink-0">
          <div
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer bg-white/[0.04] border border-white/[0.08] hover:border-white/20 rounded-[18px] transition-all duration-300 group relative overflow-hidden"
            onClick={onSettings}
            title="Settings"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[18px]" />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-black shrink-0 group-hover:scale-105 transition-all ring-2 ring-white/10 group-hover:ring-primary/40 relative z-10">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1 relative z-10 min-w-0">
              <p className="text-[13px] font-bold text-white truncate group-hover:text-primary transition-colors">{user?.username}</p>
              <p className="text-[10px] text-white/45 truncate font-semibold uppercase tracking-wider mt-0.5">{user?.tagline || 'Online & Ready'}</p>
            </div>
            <Settings className="w-5 h-5 text-white/40 group-hover:text-white group-hover:rotate-90 transition-all duration-500 shrink-0 relative z-10" />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-white/45 hover:text-danger w-full px-4 py-2.5 rounded-[14px] hover:bg-danger/10 border border-white/[0.07] hover:border-danger/25 transition-all duration-300 active:scale-95"
          >
            <LogOut className="w-4 h-4 transition-transform" />
            <span className="text-[11px] font-bold tracking-widest uppercase">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
