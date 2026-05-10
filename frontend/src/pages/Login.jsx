import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';

export default function Login({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(data.user);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-transparent">
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fadeInUp">
        <div className="flex flex-col items-center mb-8">
          <MessageSquare className="w-12 h-12 text-primary mb-2 animate-float" />
          <h1 className="text-2xl font-bold text-textPrimary">Welcome Back</h1>
          <p className="text-textSecondary text-sm">Sign in to continue to ChattyMind</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-3 bg-white/[0.05] border border-white/10 text-white placeholder-white/40 rounded-full focus:bg-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all duration-300 shadow-inner" 
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3 bg-white/[0.05] border border-white/10 text-white placeholder-white/40 rounded-full focus:bg-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all duration-300 shadow-inner" 
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full shadow-[0_0_20px_rgba(0,207,255,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 font-bold mt-4 tracking-wide">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-textSecondary">
          Don't have an account? <Link to="/register" className="text-primary font-semibold hover:text-secondary transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
