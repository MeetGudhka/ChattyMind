import { useEffect, useState } from 'react';
import { MessageSquare, Settings, LogOut } from 'lucide-react';
import axios from 'axios';

export default function Sidebar({ setAuth, user, onSelectUser, unreadCounts = {} }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users?currentUserId=${user.id}`);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    if (user?.id) fetchUsers();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  };
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-brand-600 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          ChattyMind
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contacts</h2>
        {users.map((u) => (
          <div 
            key={u._id} 
            onClick={() => onSelectUser(u)}
            className="flex items-center justify-between p-2 hover:bg-brand-50 rounded-lg cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold shrink-0">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{u.username}</p>
              </div>
            </div>
            {unreadCounts[u._id] > 0 && (
              <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-300">
                {unreadCounts[u._id]}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full p-2 rounded-lg hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
