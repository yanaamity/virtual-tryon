import { useState } from 'react';

export default function LookCard({ look, onDelete, onCompare, isComparing }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this look?')) return;
    setLoading(true);
    try {
      await fetch(`/api/looks/${look.id}`, { method: 'DELETE' });
      onDelete(look.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const url = look.compositeImageUrl;
    if (!url) return;
    
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `look-${look.id}.png`;
      link.click();
    } else {
      window.open(url, '_blank');
    }
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      isComparing ? 'border-purple-400 shadow-purple-100' : 'border-gray-100'
    }`}>
      {/* Image */}
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {look.compositeImageUrl ? (
          <img
            src={look.compositeImageUrl}
            alt={look.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Mode badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            look.visualizationMode === 'smart'
              ? 'bg-purple-500 text-white'
              : 'bg-sky-500 text-white'
          }`}>
            {look.visualizationMode === 'smart' ? '✨ Smart' : '⚡ Simple'}
          </span>
        </div>

        {isComparing && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{look.productName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{timeAgo(look.timestamp)}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onCompare(look)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              isComparing
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600'
            }`}
          >
            {isComparing ? '✓ Selected' : 'Compare'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 text-xs py-1.5 rounded-lg font-medium bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors"
          >
            Download
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
