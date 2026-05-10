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
    <div className="bg-white/[0.02] backdrop-blur-3xl border-t border-white/10 p-3 px-6 flex flex-col gap-3 relative z-20 shrink-0">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 mb-1 p-2 bg-gray-50 rounded-xl border border-gray-200 w-max self-start">
          <div className="relative">
            {selectedFile.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className="h-16 w-16 object-cover rounded-lg border border-gray-300 shadow-sm"
              />
            ) : selectedFile.type.startsWith('video/') ? (
              <video
                src={URL.createObjectURL(selectedFile)}
                className="h-16 w-16 object-cover rounded-lg border border-gray-300 shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-lg border border-gray-300 shadow-sm text-gray-600">
                <FileText className="w-8 h-8" />
              </div>
            )}
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 shadow-md transition-all hover:scale-105"
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col max-w-[150px] pr-2">
            <span className="text-xs text-gray-700 font-semibold truncate">{selectedFile.name}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Ready</span>
          </div>
        </div>
      )}

      {/* AI Tools & Actions Row */}
      {user?.settings?.aiSuggestionsEnabled !== false && (
        <div className="flex items-center w-full gap-3 overflow-x-auto pb-1 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Quick Actions (Shorter, Polite, Clarity) */}
          <div className="flex items-center gap-2 shrink-0 border-r border-white/10 pr-3">
            {['Shorter', 'Polite', 'Clarity'].map((action) => (
              <button
                key={action}
                type="button"
                disabled={!selectedUser || !text.trim() || isRefining}
                onClick={() => handleRefine(action)}
                className="text-[12px] bg-white/[0.05] hover:bg-white/[0.15] text-secondary font-bold px-4 py-2 rounded-full border border-white/20 transition-all disabled:opacity-90 flex items-center gap-1.5 active:scale-95 whitespace-nowrap hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:border-secondary/60"
              >
                {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {action}
              </button>
            ))}
          </div>

          {/* Script & Language Conversion Bars */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Convert Script */}
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.05] transition-colors">
              <Globe className="w-3.5 h-3.5 text-primary ml-1" />
              <select
                value={targetScript}
                onChange={(e) => setTargetScript(e.target.value)}
                className="text-xs bg-transparent outline-none cursor-pointer text-white font-medium disabled:opacity-50"
                disabled={!selectedUser}
              >
                <option value="English Letters" className="bg-[#0f172a] text-white">English Letters</option>
                <option value="Hindi Letters" className="bg-[#0f172a] text-white">Hindi Letters</option>
                <option value="Marathi Letters" className="bg-[#0f172a] text-white">Marathi Letters</option>
                <option value="Gujarati Letters" className="bg-[#0f172a] text-white">Gujarati Letters</option>
              </select>
              <button
                onClick={handleTranslate}
                type="button"
                disabled={!selectedUser || !text.trim() || isTranslating}
                className="text-[11px] bg-gradient-to-r from-primary to-secondary text-white font-bold px-2.5 py-1 rounded-full shadow-lg hover:shadow-[0_0_15px_rgba(0,207,255,0.4)] transition-all disabled:opacity-50 active:scale-95"
              >
                {isTranslating ? 'Converting...' : 'Auto-Type'}
              </button>
            </div>

            {/* Translate Language */}
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.05] transition-colors">
              <Globe className="w-3.5 h-3.5 text-primary ml-1" />
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="text-xs bg-transparent outline-none cursor-pointer text-white font-medium disabled:opacity-50"
                disabled={!selectedUser}
              >
                <option value="English" className="bg-[#0f172a] text-white">English</option>
                <option value="Hindi" className="bg-[#0f172a] text-white">Hindi</option>
                <option value="Marathi" className="bg-[#0f172a] text-white">Marathi</option>
                <option value="Gujarati" className="bg-[#0f172a] text-white">Gujarati</option>
              </select>
              <button
                onClick={handleTranslateLanguage}
                type="button"
                disabled={!selectedUser || !text.trim() || isTranslatingLanguage}
                className="text-[11px] bg-gradient-to-r from-primary to-secondary text-white font-bold px-2.5 py-1 rounded-full shadow-lg hover:shadow-[0_0_15px_rgba(0,207,255,0.4)] transition-all disabled:opacity-50 active:scale-95"
              >
                {isTranslatingLanguage ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Integrated Text Input Bar */}
      <div className="flex items-center gap-1 bg-white/[0.05] rounded-full p-1.5 border border-white/10 focus-within:border-primary/50 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_15px_rgba(0,207,255,0.15)] focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-300">
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
          className="text-white/60 hover:text-primary hover:bg-white/10 transition-colors p-2.5 rounded-full disabled:opacity-50 shrink-0"
          title="Attach file"
        >
          <ImageIcon className="w-[22px] h-[22px]" />
        </button>

        <button
          type="button"
          disabled={!selectedUser}
          onClick={toggleRecording}
          className={`text-white/60 transition-colors p-2.5 rounded-full disabled:opacity-50 shrink-0 relative ${isRecording ? 'text-danger bg-danger/10 animate-pulse' : 'hover:text-primary hover:bg-white/10'}`}
          title={isRecording ? "Stop listening" : "Start speaking"}
        >
          {isRecording && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full animate-ping border border-transparent"></span>}
          <Mic className="w-[22px] h-[22px]" />
        </button>

        <form className="flex-1 flex items-center h-full mr-1 ml-1" onSubmit={sendMessage}>
          <input
            type="text"
            disabled={!selectedUser || isUploading}
            value={text}
            onChange={handleTextChange}
            placeholder={selectedUser ? "Type a message..." : "Select a contact to chat"}
            className="bg-transparent border-none outline-none w-full text-white px-2 py-2 placeholder-white/40 disabled:opacity-50 text-[15px]"
          />

          <button
            type="submit"
            disabled={!selectedUser || (!text.trim() && !selectedFile) || isUploading}
            className="bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all duration-300 shadow-lg flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 ml-2"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-6 h-5 mr-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
