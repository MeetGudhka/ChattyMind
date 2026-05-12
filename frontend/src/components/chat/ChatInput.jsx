import { X, FileText, Loader2, Sparkles, Globe, Image as ImageIcon, Mic, Send } from 'lucide-react';

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
  return (
    <div className="bg-transparent p-4 px-6 flex flex-col gap-3 relative z-20 shrink-0">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-3 mb-2 p-2 bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl border border-white/10 w-max self-start shadow-premium animate-fadeInUp">
          <div className="relative">
            {selectedFile.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className="h-14 w-14 object-cover rounded-xl border border-white/10 shadow-sm"
              />
            ) : selectedFile.type.startsWith('video/') ? (
              <video
                src={URL.createObjectURL(selectedFile)}
                className="h-14 w-14 object-cover rounded-xl border border-white/10 shadow-sm"
              />
            ) : (
              <div className="h-14 w-14 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-primary">
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
          <div className="flex flex-col max-w-[150px] pr-2">
            <span className="text-xs text-white/90 font-bold truncate">{selectedFile.name}</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Ready to send</span>
          </div>
        </div>
      )}

      {/* AI Tools Row */}
      {user?.settings?.aiSuggestionsEnabled !== false && (
        <div className="flex items-center w-full gap-3 overflow-x-auto pb-2 shrink-0 no-scrollbar animate-fadeInUp">
          <div className="flex items-center gap-2 shrink-0 bg-white/[0.04] backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-premium">
            {['Shorter', 'Polite', 'Clarity'].map((action) => (
              <button
                key={action}
                type="button"
                disabled={!selectedUser || !text.trim() || isRefining}
                onClick={() => handleRefine(action)}
                className="text-[12px] hover:bg-secondary/20 text-secondary font-bold px-4 py-1.5 rounded-full transition-all duration-300 disabled:opacity-20 flex items-center gap-2 active:scale-90 whitespace-nowrap hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:text-white border border-transparent hover:border-secondary/30"
              >
                {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span className="tracking-wide">{action}</span>
              </button>
            ))}
          </div>

          <div className="h-5 w-[1.5px] bg-white/10 shrink-0 mx-1" />

          {/* Script & Language Selection */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2.5 bg-white/[0.04] px-4 py-2 rounded-full border border-white/10 hover:border-primary/50 transition-all duration-500 shadow-premium group">
              <Globe className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
              <select
                value={targetScript}
                onChange={(e) => setTargetScript(e.target.value)}
                className="text-[12px] bg-transparent outline-none cursor-pointer text-white/80 font-bold disabled:opacity-50 appearance-none"
                disabled={!selectedUser}
              >
                <option value="English Letters" className="bg-[#0a0a1e] text-white">English Letters</option>
                <option value="Hindi Letters" className="bg-[#0a0a1e] text-white">Hindi Letters</option>
                <option value="Marathi Letters" className="bg-[#0a0a1e] text-white">Marathi Letters</option>
                <option value="Gujarati Letters" className="bg-[#0a0a1e] text-white">Gujarati Letters</option>
              </select>
              <button
                onClick={handleTranslate}
                type="button"
                disabled={!selectedUser || !text.trim() || isTranslating}
                className="text-[11px] bg-primary/20 text-primary hover:bg-primary hover:text-white font-black px-3.5 py-1.5 rounded-full transition-all duration-300 disabled:opacity-30 active:scale-95 uppercase tracking-widest shadow-sm hover:shadow-glow"
              >
                {isTranslating ? '...' : 'Auto-Type'}
              </button>
            </div>

            <div className="flex items-center gap-2.5 bg-white/[0.04] px-4 py-2 rounded-full border border-white/10 hover:border-secondary/50 transition-all duration-500 shadow-premium group">
              <Globe className="w-4 h-4 text-secondary group-hover:rotate-12 transition-transform" />
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="text-[12px] bg-transparent outline-none cursor-pointer text-white/80 font-bold disabled:opacity-50 appearance-none"
                disabled={!selectedUser}
              >
                <option value="English" className="bg-[#0a0a1e] text-white">English</option>
                <option value="Hindi" className="bg-[#0a0a1e] text-white">Hindi</option>
                <option value="Marathi" className="bg-[#0a0a1e] text-white">Marathi</option>
                <option value="Gujarati" className="bg-[#0a0a1e] text-white">Gujarati</option>
              </select>
              <button
                onClick={handleTranslateLanguage}
                type="button"
                disabled={!selectedUser || !text.trim() || isTranslatingLanguage}
                className="text-[11px] bg-secondary/20 text-secondary hover:bg-secondary hover:text-white font-black px-3.5 py-1.5 rounded-full transition-all duration-300 disabled:opacity-30 active:scale-95 uppercase tracking-widest shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                {isTranslatingLanguage ? '...' : 'Translate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Integrated Text Input Bar */}
      <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-3xl rounded-[28px] p-2 pl-4 border border-white/10 focus-within:border-primary/40 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_30px_rgba(0,207,255,0.1)] transition-all duration-500 shadow-premium">
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
          className="text-white/40 hover:text-primary hover:bg-white/5 transition-all p-2.5 rounded-full disabled:opacity-20 shrink-0"
          title="Attach file"
        >
          <ImageIcon className="w-[20px] h-[20px]" />
        </button>

        <button
          type="button"
          disabled={!selectedUser}
          onClick={toggleRecording}
          className={`text-white/40 transition-all p-2.5 rounded-full disabled:opacity-20 shrink-0 relative ${isRecording ? 'text-danger bg-danger/10 animate-pulse' : 'hover:text-primary hover:bg-white/5'}`}
          title={isRecording ? "Stop listening" : "Start speaking"}
        >
          {isRecording && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full animate-ping border border-transparent"></span>}
          <Mic className="w-[20px] h-[20px]" />
        </button>

        <form className="flex-1 flex items-center h-full gap-2" onSubmit={sendMessage}>
          <input
            type="text"
            disabled={!selectedUser || isUploading}
            value={text}
            onChange={handleTextChange}
            placeholder={selectedUser ? "Write something..." : "Select a contact to begin"}
            className="bg-transparent border-none outline-none w-full text-white px-2 py-2 placeholder-white/30 disabled:opacity-50 text-[15px] font-medium"
          />

          <button
            type="submit"
            disabled={!selectedUser || (!text.trim() && !selectedFile) || isUploading}
            className="bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:scale-105 active:scale-95 hover:shadow-glow transition-all duration-300 shadow-lg flex items-center justify-center shrink-0 disabled:opacity-20 disabled:grayscale w-10 h-10 ml-auto"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -mr-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
