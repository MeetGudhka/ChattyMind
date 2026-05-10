import { useEffect, useState } from 'react';
import { MessageSquare, Settings, LogOut } from 'lucide-react';
import axios from 'axios';

export default function Sidebar({ setAuth, user, onSelectUser, unreadCounts = {}, onlineUsers = [], onSettings }) {
  const [users, setUsers] = useState([]);

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
  
  return (
    <div className="w-64 bg-white/[0.02] backdrop-blur-3xl border-r border-white/10 h-full flex flex-col shrink-0 animate-slideInLeft">
      <div className="h-16 px-6 border-b border-white/10 flex items-center shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          <MessageSquare className="w-6 h-6 text-primary animate-float" />
          ChattyMind
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h2 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-4">Contacts</h2>
        {users.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          
          return (
            <div 
              key={u._id} 
              onClick={() => onSelectUser(u)}
              className="flex items-center justify-between p-3 bg-white/[0.02] rounded-2xl cursor-pointer transition-all duration-300 border border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:shadow-xl hover:-translate-y-0.5 group relative overflow-hidden"
            >
              {/* Subtle hover glow at the top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner ring-1 transition-all duration-300 ${isOnline ? 'bg-gradient-to-br from-primary to-secondary ring-white/20 group-hover:ring-primary/50' : 'bg-white/5 ring-white/10 text-white/50 grayscale'}`}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  {/* Online indicator dot */}
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#0f172a] transition-colors duration-300 ${isOnline ? 'bg-active shadow-[0_0_10px_#00ffaa]' : 'bg-white/20'}`}></div>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-[14px] font-bold truncate transition-colors tracking-wide ${isOnline ? 'text-white/90 group-hover:text-white' : 'text-white/60 group-hover:text-white/80'}`}>{u.username}</p>
                  <p className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 transition-colors ${isOnline ? 'text-active drop-shadow-[0_0_5px_rgba(0,255,170,0.3)]' : 'text-white/40'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              {unreadCounts[u._id] > 0 && (
                <div className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center shadow-[0_0_15px_rgba(0,207,255,0.5)] animate-bounceDelay">
                  {unreadCounts[u._id]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/10 flex flex-col gap-4 bg-white/[0.01]">
        <div 
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/[0.05] rounded-2xl transition-all group relative overflow-hidden border border-transparent hover:border-white/10"
          onClick={onSettings}
          title="Profile Settings"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 ring-2 ring-transparent group-hover:ring-primary/30">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-[14px] font-bold text-textPrimary truncate group-hover:text-primary transition-colors tracking-wide">{user?.username}</p>
            <p className="text-[11px] text-textSecondary truncate opacity-70">{user?.tagline || 'Available'}</p>
          </div>
          <Settings className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
        </div>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-danger hover:text-[#ff2a5f] w-full px-4 py-3 rounded-xl hover:bg-danger/10 hover:border hover:border-danger/20 transition-all duration-300 border border-transparent group/logout"
        >
          <LogOut className="w-4 h-4 group-hover/logout:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-semibold tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
}
