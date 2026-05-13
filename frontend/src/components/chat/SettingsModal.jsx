import { useState } from 'react';
import { X, Settings, Eye, Loader2, Save, User, Tag, Phone, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import Dashboard from './Dashboard';

export default function SettingsModal({ isOpen, onClose, user, onUpdateUser }) {
  const [tagline, setTagline] = useState(user.tagline || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(user.settings?.aiSuggestionsEnabled ?? true);
  const [readReceipts, setReadReceipts] = useState(user.settings?.readReceipts ?? true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const userId = user._id || user.id;
      const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
        userId,
        tagline,
        phoneNumber,
        settings: { aiSuggestionsEnabled, readReceipts }
      });
      onUpdateUser(data);
      onClose();
    } catch (err) {
      console.error('Error updating settings:', err.response?.data || err.message);
      setError('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const Toggle = ({ enabled, onToggle, label, description }) => (
    <div
      onClick={onToggle}
      className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl cursor-pointer hover:bg-white/[0.06] hover:border-white/15 transition-all group"
    >
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white/85">{label}</span>
        <span className="text-[11px] text-white/50 mt-0.5">{description}</span>
      </div>
      <div className="relative w-11 h-6 pointer-events-none ml-4 shrink-0">
        <div className={`w-full h-full rounded-full transition-colors duration-300 ${enabled ? 'bg-primary' : 'bg-white/20'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${enabled ? 'translate-x-5' : ''}`} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#0f172a]/98 border border-white/[0.10] w-full sm:max-w-xl md:max-w-2xl rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slideInUp sm:animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 md:px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Settings
            </h3>
            <p className="text-xs md:text-sm text-white/50 mt-1">Personalize your ChattyMind experience</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full text-white/55 hover:text-white transition-all"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 md:px-8 pt-3 flex gap-4 md:gap-6 border-b border-white/[0.07] shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'profile' ? 'text-primary' : 'text-white/45 hover:text-white/70'}`}
          >
            <User className="w-4 h-4" /> Profile & Privacy
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fadeIn" />}
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'dashboard' ? 'text-secondary' : 'text-white/45 hover:text-white/70'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> AI Insights
            {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full animate-fadeIn" />}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 no-scrollbar">
          {activeTab === 'profile' ? (
            <div className="space-y-8">
              {/* Profile fields */}
              <section className="space-y-4">
                <h4 className="text-[11px] font-bold text-white/55 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Account & Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/55 uppercase tracking-widest px-1">Tagline</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="How are you feeling today?"
                        className="w-full bg-white/[0.05] border border-white/[0.10] rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/55 uppercase tracking-widest px-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="XXXXXXXXXX"
                        className="w-full bg-white/[0.05] border border-white/[0.10] rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy Toggles */}
              <section className="space-y-4">
                <h4 className="text-[11px] font-bold text-white/55 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Preferences & Privacy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Toggle
                    enabled={aiSuggestionsEnabled}
                    onToggle={() => setAiSuggestionsEnabled(v => !v)}
                    label="AI Suggestions"
                    description="Real-time writing help"
                  />
                  <Toggle
                    enabled={readReceipts}
                    onToggle={() => setReadReceipts(v => !v)}
                    label="Read Receipts"
                    description="Show message status ticks"
                  />
                </div>
              </section>
            </div>
          ) : (
            <Dashboard user={user} />
          )}
        </div>

        {/* Footer save button */}
        {activeTab === 'profile' && (
          <div className="px-5 md:px-8 py-4 md:py-5 border-t border-white/10 bg-white/[0.01] shrink-0">
            {error && <p className="text-danger text-xs mb-3 text-center font-medium">{error}</p>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3.5 md:py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
