import { Bot, RefreshCw, Hand, ShieldAlert, Zap, Globe2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userId = user._id || user.id;
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/dashboard/${userId}`);
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-4">
        <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
        <p className="text-white/60 text-sm font-medium animate-pulse">Generating AI Insights...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-white/50 py-10">Unable to load dashboard data.</div>;
  }

  const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] transition-all group">
      <div className={`p-3 rounded-xl ${colorClass} bg-white/[0.05] shadow-inner group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-white/55 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Bot} label="AI Messages Sent" value={data.aiMessagesCount} colorClass="text-primary" />
        <StatCard icon={Zap} label="Refinements Used" value={data.refinementsCount} colorClass="text-secondary" />
        <StatCard icon={Globe2} label="Translations" value={data.translationsCount} colorClass="text-blue-400" />
        <StatCard icon={Hand} label="Total Interactions" value={data.totalMessages} colorClass="text-active" />
      </div>

      {/* Persona Analysis */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Bot className="w-24 h-24 text-secondary" />
        </div>
        <h4 className="text-[11px] font-bold text-white/55 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 relative z-10">
          <ShieldAlert className="w-4 h-4 text-secondary" />
          AI Communication Persona
        </h4>
        <div className="space-y-3 relative z-10">
          <p className="text-[15px] font-medium text-white/90 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
            {data.persona || "You are a clear and direct communicator who prefers efficiency over elaboration."}
          </p>
        </div>
      </div>
    </div>
  );
}
