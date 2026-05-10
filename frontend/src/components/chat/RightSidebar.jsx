import { X, Phone, Video, Image as ImageIcon, FileText } from 'lucide-react';

export default function RightSidebar({
  isRightSidebarOpen,
  selectedUser,
  setIsRightSidebarOpen,
  messages,
  setExpandedMedia
}) {
  if (!isRightSidebarOpen || !selectedUser) return null;

  return (
    <div className="w-80 bg-[#0b101e]/80 backdrop-blur-3xl border-l border-white/10 flex flex-col shrink-0 animate-slideInRight z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between shrink-0">
        <h3 className="text-md font-bold text-white">Contact Info</h3>
        <button
          onClick={() => setIsRightSidebarOpen(false)}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-4 bg-gradient-to-br from-primary to-secondary ring-white/10">
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">{selectedUser.username}</h3>
            <p className="text-sm text-primary font-medium mt-1 italic opacity-80">"{selectedUser.tagline || 'Available'}"</p>
            <p className="text-xs text-white/40 mt-2">{selectedUser.email}</p>
          </div>
          <div className="w-full space-y-4 mt-2">
            <div className="flex items-center gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Phone</span>
                <span className="text-sm text-white/90">{selectedUser.phoneNumber || 'Not provided'}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col items-center gap-1 cursor-pointer group p-2 rounded-2xl hover:bg-white/[0.05] transition-all">
                <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center text-primary transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-white/50 group-hover:text-white/80">Audio</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 cursor-pointer group p-2 rounded-2xl hover:bg-white/[0.05] transition-all">
                <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-secondary/20 flex items-center justify-center text-secondary transition-all">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-white/50 group-hover:text-white/80">Video</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> Media, Links, and Docs
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {messages.filter(m => m.mediaUrl).map((m, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-white/5 flex items-center justify-center" onClick={() => setExpandedMedia(m.mediaUrl)}>
                {m.mediaType?.startsWith('video/') || m.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video src={m.mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : m.mediaType?.startsWith('image/') || m.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || !m.mediaType ? (
                  <img src={m.mediaUrl} alt="media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <FileText className="w-8 h-8 text-white/50 group-hover:scale-110 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {m.mediaType?.startsWith('video/') || m.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <Video className="w-5 h-5 text-white" />
                  ) : m.mediaType?.startsWith('image/') || m.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || !m.mediaType ? (
                    <ImageIcon className="w-5 h-5 text-white" />
                  ) : (
                    <FileText className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            ))}
            {messages.filter(m => m.mediaUrl).length === 0 && (
              <div className="col-span-3 text-center py-6 bg-white/[0.02] rounded-xl border border-white/5">
                <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40">No media shared yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
