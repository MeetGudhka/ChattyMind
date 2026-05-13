import { X, Phone, Video, Image as ImageIcon, FileText } from 'lucide-react';

export default function RightSidebar({
  isRightSidebarOpen,
  selectedUser,
  setIsRightSidebarOpen,
  messages,
  setExpandedMedia
}) {
  if (!isRightSidebarOpen || !selectedUser) return null;

  const mediaMessages = messages.filter(m => m.mediaUrl);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden animate-fadeIn"
        onClick={() => setIsRightSidebarOpen(false)}
      />

      {/* Panel */}
      <div className="
        fixed right-0 top-0 bottom-0 z-30
        lg:relative lg:z-auto
        w-[85vw] sm:w-80
        bg-[#0b101e]/90 lg:bg-[#0b101e]/80
        backdrop-blur-3xl border-l border-white/10
        flex flex-col shrink-0
        animate-slideInRight
        shadow-[-10px_0_40px_rgba(0,0,0,0.4)]
      ">
        {/* Header */}
        <div className="h-14 md:h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-[15px] font-bold text-white">Contact Info</h3>
          <button
            onClick={() => setIsRightSidebarOpen(false)}
            className="p-2 rounded-full text-white/55 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Profile section */}
          <div className="p-6 border-b border-white/10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-4xl text-white font-bold shadow-[0_0_25px_rgba(168,85,247,0.35)] ring-4 bg-gradient-to-br from-primary to-secondary ring-white/10">
              {selectedUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <h3 className="text-[18px] font-bold text-white">{selectedUser.username}</h3>
              <p className="text-sm text-primary font-medium mt-1 italic opacity-90">
                "{selectedUser.tagline || 'Available'}"
              </p>
              <p className="text-xs text-white/55 mt-2">{selectedUser.email}</p>
            </div>

            {/* Contact details */}
            <div className="w-full space-y-3 mt-1">
              <div className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Phone</span>
                  <span className="text-sm text-white/85 truncate">{selectedUser.phoneNumber || 'Not provided'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group p-3 rounded-2xl hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] group-hover:bg-primary/20 flex items-center justify-center text-primary transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/55 group-hover:text-white/80 font-medium">Audio</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group p-3 rounded-2xl hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] group-hover:bg-secondary/20 flex items-center justify-center text-secondary transition-all">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white/55 group-hover:text-white/80 font-medium">Video</span>
                </div>
              </div>
            </div>
          </div>

          {/* Media grid */}
          <div className="p-5">
            <h4 className="text-[13px] font-bold text-white/75 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Media, Links & Docs
            </h4>

            {mediaMessages.length === 0 ? (
              <div className="text-center py-8 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40">No media shared yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map((m, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-white/[0.04] flex items-center justify-center border border-white/[0.06] hover:border-white/15 transition-all"
                    onClick={() => setExpandedMedia(m.mediaUrl)}
                  >
                    {m.mediaType?.startsWith('video/') || m.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <video src={m.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : m.mediaType?.startsWith('image/') || m.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || !m.mediaType ? (
                      <img src={m.mediaUrl} alt="media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <FileText className="w-8 h-8 text-white/50 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {m.mediaType?.startsWith('video/') || m.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i)
                        ? <Video className="w-5 h-5 text-white" />
                        : m.mediaType?.startsWith('image/') || m.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || !m.mediaType
                        ? <ImageIcon className="w-5 h-5 text-white" />
                        : <FileText className="w-5 h-5 text-white" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
