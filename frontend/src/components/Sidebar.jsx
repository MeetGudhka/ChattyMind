import { useEffect, useState } from 'react';
import { Search, MessageSquare, Settings, LogOut } from 'lucide-react';
import axios from 'axios';

export default function Sidebar({ setAuth, user, onSelectUser, unreadCounts = {}, onlineUsers = [], onSettings }) {
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

  return (
    <div className="w-64 bg-white/[0.02] backdrop-blur-3xl border-r border-white/10 h-full flex flex-col shrink-0 animate-slideInLeft">
      <div className="h-16 px-6 border-b border-white/10 flex items-center shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          <MessageSquare className="w-6 h-6 text-primary animate-float" />
          ChattyMind
        </h1>
      </div>

      <div className="p-4 border-b border-white/5">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 focus:border-primary/40 focus:bg-white/[0.06] rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mb-4 ml-3 opacity-80">
          {searchTerm ? 'Search Results' : 'Contacts'}
        </h2>
        {filteredUsers.map((u, index) => {
          const isOnline = onlineUsers.includes(u._id);

          return (
            <div
              key={u._id}
              onClick={() => onSelectUser(u)}
              className="flex items-center justify-between p-3.5 bg-white/[0.01] rounded-[24px] cursor-pointer transition-all duration-500 border border-transparent hover:bg-white/[0.08] hover:border-white/10 hover:shadow-premium group relative overflow-hidden animate-slideInLeft"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Dynamic hover glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="flex items-center gap-4 min-w-0 relative z-10">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-premium ring-1 transition-all duration-500 ${isOnline ? 'bg-gradient-to-br from-primary to-secondary ring-white/10 group-hover:ring-white/40 group-hover:scale-105' : 'bg-white/5 ring-white/5 text-white/20 grayscale'}`}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  {/* Online indicator dot with pulse */}
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-[#0a0a1e] transition-all duration-500 ${isOnline ? 'bg-active shadow-glow animate-pulse' : 'bg-white/10'}`}></div>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-[15px] font-bold truncate transition-all tracking-wide ${isOnline ? 'text-white group-hover:text-primary' : 'text-white/40 group-hover:text-white/70'}`}>{u.username}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-[11px] font-semibold transition-colors ${isOnline ? 'text-active/70' : 'text-white/20'}`}>
                      {isOnline ? 'Active Now' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
              </div>
              {unreadCounts[u._id] > 0 && (
                <div className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black px-2.5 py-1 rounded-full min-w-[24px] h-[24px] flex items-center justify-center shadow-glow animate-bounceDelay relative z-10">
                  {unreadCounts[u._id]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 flex flex-col gap-3 bg-white/[0.02] backdrop-blur-3xl rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
        <div
          className="flex items-center gap-3 px-3 py-3 cursor-pointer bg-white/[0.03] border border-white/5 hover:border-white/20 rounded-[22px] transition-all duration-500 group relative overflow-hidden shadow-inner-light"
          onClick={onSettings}
          title="Profile Settings"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-md font-black shrink-0 shadow-premium group-hover:scale-105 transition-all duration-500 ring-2 ring-white/10 group-hover:ring-primary/40 relative z-10">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1 relative z-10">
            <p className="text-[14px] font-bold text-white truncate tracking-wide group-hover:text-primary transition-colors">{user?.username}</p>
            <p className="text-[9px] text-white/30 truncate font-bold uppercase tracking-[0.05em] mt-0.5">{user?.tagline || 'Online & Available'}</p>
          </div>
          <Settings className="w-6 h-6 text-white/20 group-hover:text-white group-hover:rotate-90 transition-all duration-700 shrink-0 relative z-10" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 text-white/25 hover:text-danger w-full px-4 py-2.5 rounded-[18px] hover:bg-danger/10 border border-white/5 hover:border-danger/20 transition-all duration-500 group/logout active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5 group-hover/logout:-translate-x-1 transition-transform opacity-60" />
          <span className="text-[10px] font-black tracking-[0.15em] uppercase">Logout Session</span>
        </button>
      </div>
    </div>
  );
}
