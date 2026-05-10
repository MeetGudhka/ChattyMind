import { X, FileText } from 'lucide-react';

export default function MediaModal({ expandedMedia, setExpandedMedia }) {
  if (!expandedMedia) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={() => setExpandedMedia(null)}
    >
      <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
        <button
          className="absolute -top-12 md:-top-10 right-0 text-white hover:text-gray-300 p-2 z-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedMedia(null);
          }}
        >
          <X className="w-8 h-8 drop-shadow-md" />
        </button>
        {expandedMedia.match(/\.(mp4|webm|ogg|mov)$/i) ? (
          <video
            src={expandedMedia}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        ) : expandedMedia.match(/\.(jpeg|jpg|gif|png|webp)$/i) || !expandedMedia.match(/\./) ? (
          <img
            src={expandedMedia}
            alt="Expanded media"
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <FileText className="w-16 h-16 text-primary" />
            <a href={expandedMedia} target="_blank" rel="noopener noreferrer" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/80 transition-colors font-medium">
              Download Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
