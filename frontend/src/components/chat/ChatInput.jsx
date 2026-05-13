import { X, FileText, Loader2, Sparkles, Globe, Image as ImageIcon, Mic, Send } from 'lucide-react';
import { useState } from 'react';

export default function ChatInput({
  user,
  selectedUser,
  selectedFile,
  setSelectedFile,
  isUploading,
  text,
  setText,
  handleTextChange,
  isRefining,
  handleRefine,
  targetScript,
  setTargetScript,
  isTranslating,
  handleTranslate,
  targetLanguage,
  setTargetLanguage,
  isTranslatingLanguage,
  handleTranslateLanguage,
  fileInputRef,
  handleFileChange,
  isRecording,
  toggleRecording,
  sendMessage
}) {
  const [showAITools, setShowAITools] = useState(false);
  const aiEnabled = user?.settings?.aiSuggestionsEnabled !== false;

  return (
    <div className="bg-transparent p-3 md:p-4 px-3 md:px-6 flex flex-col gap-2 md:gap-3 relative z-20 shrink-0 pb-safe">

      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-2 bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl border border-white/10 w-max self-start shadow-premium animate-fadeInUp">
          <div className="relative">
            {selectedFile.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(selectedFile)} alt="preview" className="h-12 w-12 md:h-14 md:w-14 object-cover rounded-xl border border-white/10" />
            ) : selectedFile.type.startsWith('video/') ? (
              <video src={URL.createObjectURL(selectedFile)} className="h-12 w-12 md:h-14 md:w-14 object-cover rounded-xl border border-white/10" />
            ) : (
              <div className="h-12 w-12 md:h-14 md:w-14 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-primary">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:scale-110 shadow-glow transition-all"
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col max-w-[120px] md:max-w-[150px] pr-2">
            <span className="text-xs text-white/90 font-bold truncate">{selectedFile.name}</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Ready to send</span>
          </div>
        </div>
      )}

      {/* AI Tools — collapsible on mobile */}
      {aiEnabled && selectedUser && (
        <>
          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setShowAITools(v => !v)}
            className="md:hidden flex items-center gap-2 text-[11px] font-bold text-white/55 hover:text-primary transition-colors self-start px-2 py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            {showAITools ? 'Hide AI Tools' : 'AI Tools'}
          </button>

          {/* AI Tools Row — always visible on md+, toggle on mobile */}
          <div className={`${showAITools ? 'flex' : 'hidden'} md:flex items-center w-full gap-2 md:gap-3 overflow-x-auto pb-1 shrink-0 no-scrollbar animate-fadeInUp`}>
            {/* Refine buttons */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white/[0.04] backdrop-blur-xl px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 shadow-premium">
              {['Shorter', 'Polite', 'Clarity'].map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={!text.trim() || isRefining}
                  onClick={() => handleRefine(action)}
                  className="text-[11px] md:text-[12px] hover:bg-secondary/20 text-secondary font-bold px-3 md:px-4 py-1.5 rounded-full transition-all duration-300 disabled:opacity-25 flex items-center gap-1.5 active:scale-90 whitespace-nowrap hover:text-white border border-transparent hover:border-secondary/30"
                >
                  {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>{action}</span>
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-white/15 shrink-0" />

            {/* Script & Language */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/50 transition-all group">
                <Globe className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform shrink-0" />
                <select
                  value={targetScript}
                  onChange={(e) => setTargetScript(e.target.value)}
                  className="text-[11px] bg-transparent outline-none cursor-pointer text-white/80 font-bold appearance-none max-w-[90px]"
                >
                  <option value="English Letters" className="bg-[#0a0a1e] text-white">English</option>
                  <option value="Hindi Letters" className="bg-[#0a0a1e] text-white">Hindi</option>
                  <option value="Marathi Letters" className="bg-[#0a0a1e] text-white">Marathi</option>
                  <option value="Gujarati Letters" className="bg-[#0a0a1e] text-white">Gujarati</option>
                </select>
                <button
                  onClick={handleTranslate}
                  type="button"
                  disabled={!text.trim() || isTranslating}
                  className="text-[10px] bg-primary/20 text-primary hover:bg-primary hover:text-white font-black px-3 py-1 rounded-full transition-all disabled:opacity-30 active:scale-95 uppercase tracking-wider"
                >
                  {isTranslating ? '...' : 'Type'}
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/10 hover:border-secondary/50 transition-all group">
                <Globe className="w-3.5 h-3.5 text-secondary group-hover:rotate-12 transition-transform shrink-0" />
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="text-[11px] bg-transparent outline-none cursor-pointer text-white/80 font-bold appearance-none max-w-[80px]"
                >
                  <option value="English" className="bg-[#0a0a1e] text-white">English</option>
                  <option value="Hindi" className="bg-[#0a0a1e] text-white">Hindi</option>
                  <option value="Marathi" className="bg-[#0a0a1e] text-white">Marathi</option>
                  <option value="Gujarati" className="bg-[#0a0a1e] text-white">Gujarati</option>
                </select>
                <button
                  onClick={handleTranslateLanguage}
                  type="button"
                  disabled={!text.trim() || isTranslatingLanguage}
                  className="text-[10px] bg-secondary/20 text-secondary hover:bg-secondary hover:text-white font-black px-3 py-1 rounded-full transition-all disabled:opacity-30 active:scale-95 uppercase tracking-wider"
                >
                  {isTranslatingLanguage ? '...' : 'Translate'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Input Bar */}
      <div className="flex items-center gap-1.5 bg-white/[0.05] backdrop-blur-3xl rounded-[26px] p-1.5 pl-3 border border-white/[0.10] focus-within:border-primary/45 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_25px_rgba(0,207,255,0.10)] transition-all duration-500 shadow-premium">
        <input
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button
          type="button"
          disabled={!selectedUser || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="text-white/55 hover:text-primary hover:bg-white/5 transition-all p-2 rounded-full disabled:opacity-25 shrink-0"
          title="Attach file"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          disabled={!selectedUser}
          onClick={toggleRecording}
          className={`transition-all p-2 rounded-full disabled:opacity-25 shrink-0 relative ${isRecording ? 'text-danger bg-danger/10 animate-pulse' : 'text-white/55 hover:text-primary hover:bg-white/5'}`}
          title={isRecording ? 'Stop listening' : 'Start speaking'}
        >
          {isRecording && <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-ping" />}
          <Mic className="w-5 h-5" />
        </button>

        <form className="flex-1 flex items-center h-full gap-2 min-w-0" onSubmit={sendMessage}>
          <input
            type="text"
            disabled={!selectedUser || isUploading}
            value={text}
            onChange={handleTextChange}
            placeholder={selectedUser ? 'Write something...' : 'Select a contact to begin'}
            className="bg-transparent border-none outline-none w-full text-white px-1 py-2 placeholder-white/35 disabled:opacity-50 text-[14px] md:text-[15px] font-medium min-w-0"
          />

          <button
            type="submit"
            disabled={!selectedUser || (!text.trim() && !selectedFile) || isUploading}
            className="bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:scale-105 active:scale-95 hover:shadow-glow transition-all duration-300 shadow-lg flex items-center justify-center shrink-0 disabled:opacity-25 disabled:grayscale w-9 h-9 md:w-10 md:h-10 ml-auto"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
