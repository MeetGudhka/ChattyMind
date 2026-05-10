import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Brain, TrendingUp, Target, MessageSquare, Zap, Star, Loader2, RefreshCw } from 'lucide-react';

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      const userId = user._id || user.id;
      const [statsRes, personaRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/analytics/${userId}`),
        axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/analyze-persona`, { userId })
      ]);
      
      setData(statsRes.data);
      if (personaRes.data.error) {
        setError(personaRes.data.error);
        setPersona(null);
      } else {
        setPersona(personaRes.data);
        setError(null);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to connect to the analysis engine. Check if backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/40 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Gemini AI is analyzing your communication style...</p>
      </div>
    );
  }

  const STATS = [
    { label: 'Messages Sent', value: data?.sentCount || 0, icon: MessageSquare, color: 'text-primary' },
    { label: 'Messages Received', value: data?.receivedCount || 0, icon: Target, color: 'text-secondary' },
    { label: 'Sentiment Score', value: persona?.sentimentScore || 0, icon: Star, color: 'text-yellow-400' },
    { label: 'Activity Score', value: Math.min(10, ((data?.sentCount || 0) / 5)).toFixed(1), icon: Zap, color: 'text-emerald-400' },
  ];

  const COLORS = ['#00cfff', '#a855f7', '#10b981', '#f59e0b'];

  // Pad daily trends if only one day exists to make the graph look better
  const displayTrends = data?.dailyTrends?.length === 1 
    ? [{ day: 'Start', count: 0 }, ...data.dailyTrends] 
    : data?.dailyTrends;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Real-time Analysis</h4>
        <button 
          onClick={() => fetchAllData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl text-[10px] font-bold text-white/60 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 p-4 rounded-3xl hover:bg-white/[0.06] transition-all group">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2 group-hover:scale-110 transition-transform`} />
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tone Breakdown Pie */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] flex flex-col h-[350px]">
          <h4 className="text-sm font-bold text-white/80 mb-6 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Communication Persona
          </h4>
          <div className="flex-1 min-h-0">
            {persona ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={persona.toneBreakdown}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {persona.toneBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Brain className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-[11px] text-white/30 italic">
                  {error || "Sent messages are required for analysis. Try sending a few more!"}
                </p>
              </div>
            )}
          </div>
          {persona && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {persona.toneBreakdown.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-white/60">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{t.name} ({t.value}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Trend */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] flex flex-col h-[350px]">
          <h4 className="text-sm font-bold text-white/80 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" /> Messaging Activity (7 Days)
          </h4>
          <div className="flex-1 min-h-0">
            {displayTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayTrends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--secondary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/20 text-xs italic">
                Send your first message to see activity trends!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Message Insights */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/10 p-6 rounded-[2rem]">
        {persona ? (
          <div className="flex items-center gap-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h5 className="text-white font-bold">{persona.personaTitle}</h5>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">{persona.summary}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 opacity-50">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-white/20" />
            </div>
            <div>
              <h5 className="text-white/60 font-bold italic">Persona Analysis Pending</h5>
              <p className="text-xs text-white/40 mt-1">Chat more to unlock your unique AI communication profile!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
