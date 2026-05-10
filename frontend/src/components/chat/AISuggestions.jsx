import { Sparkles } from 'lucide-react';

export default function AISuggestions({
  selectedUser,
  text,
  isSuggesting,
  suggestions,
  tone,
  setTone,
  setIsSuggesting,
  fetchSuggestions,
  setText,
  setSuggestions,
  lastFetchedTextRef
}) {
  if (!selectedUser || text.trim().length < 3 || (!isSuggesting && suggestions.length === 0)) {
    return null;
  }

  return (
    <div className="px-6 py-2 shrink-0 relative z-10 w-full animate-fadeInUp">
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-xl w-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-primary tracking-wider flex items-center gap-1.5 uppercase drop-shadow-[0_0_8px_rgba(0,207,255,0.5)]">
            <Sparkles className="w-4 h-4 text-secondary" />
            Smart Suggestions
          </h3>
          {/* Tone Selector */}
          <select
            value={tone}
            onChange={(e) => {
              setTone(e.target.value);
              if (text.trim()) {
                setIsSuggesting(true);
                lastFetchedTextRef.current = text.trim();
                fetchSuggestions(text.trim());
              }
            }}
            className="text-xs border border-white/10 rounded-full p-1.5 px-3 bg-white/[0.05] backdrop-blur-md outline-none cursor-pointer text-white font-medium hover:border-primary/50 hover:bg-white/[0.08] transition-colors"
          >
            <option value="Casual" className="bg-[#0f172a] text-white">Casual</option>
            <option value="Professional" className="bg-[#0f172a] text-white">Professional</option>
            <option value="Friendly" className="bg-[#0f172a] text-white">Friendly</option>
            <option value="Expressive" className="bg-[#0f172a] text-white">Expressive</option>
          </select>
        </div>

        {isSuggesting && suggestions.length === 0 ? (
          <div className="flex items-center gap-2 p-3 text-primary text-sm font-medium bg-white/[0.03] rounded-xl border border-white/10">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '75ms' }}></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            Refining text using AI...
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => { setText(sug); setSuggestions([]); setIsSuggesting(false); }}
                className="w-full text-left bg-white/[0.02] backdrop-blur-md text-sm text-white/90 p-3 rounded-xl border border-white/10 shadow-sm hover:border-white/20 hover:bg-white/[0.06] hover:shadow-md hover:-translate-y-0.5 transition-all font-medium"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
