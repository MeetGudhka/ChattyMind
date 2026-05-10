import { useState } from 'react';
import { X, Settings, Eye, CheckCircle, Loader2, Save, User, Tag, Phone, LayoutDashboard, BarChart4 } from 'lucide-react';
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
        settings: {
          aiSuggestionsEnabled,
          readReceipts
        }
      });
      
      onUpdateUser(data);
      onClose();
    } catch (err) {
      console.error("Error updating settings:", err.response?.data || err.message);
      setError('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" /> Settings
            </h3>
            <p className="text-sm text-white/40 mt-1">Personalize your ChattyMind experience</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 pt-4 flex gap-6 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" /> Profile & Privacy
            </div>
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-fadeIn" />}
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'dashboard' ? 'text-secondary' : 'text-white/40 hover:text-white/60'}`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> AI Insights Dashboard
            </div>
            {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary animate-fadeIn" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'profile' ? (
            <div className="space-y-10">
              {/* Account & Profile Section */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="w-4 h-4" /> Account & Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Tagline</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="How are you feeling today?"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="XXXXXXXXXX"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy Toggles */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Preferences & Privacy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setAiSuggestionsEnabled(!aiSuggestionsEnabled)}
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-white/80">AI Suggestions</span>
                      <span className="text-[10px] text-white/40">Real-time writing help</span>
                    </div>
                    <div className="relative w-12 h-6 pointer-events-none">
                      <div className={`w-full h-full rounded-full transition-colors duration-300 ${aiSuggestionsEnabled ? 'bg-primary' : 'bg-white/20'}`} />
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${aiSuggestionsEnabled ? 'translate-x-6' : ''}`} />
                    </div>
                  </div>

                  <div 
                    onClick={() => setReadReceipts(!readReceipts)}
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-white/80">Read Receipts</span>
                      <span className="text-[10px] text-white/40">Status checkmarks</span>
                    </div>
                    <div className="relative w-12 h-6 pointer-events-none">
                      <div className={`w-full h-full rounded-full transition-colors duration-300 ${readReceipts ? 'bg-primary' : 'bg-white/20'}`} />
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${readReceipts ? 'translate-x-6' : ''}`} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <Dashboard user={user} />
          )}
        </div>

        {activeTab === 'profile' && (
          <div className="p-8 border-t border-white/10 bg-white/[0.01]">
            {error && <p className="text-danger text-xs mb-4 text-center">{error}</p>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Configuration</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
