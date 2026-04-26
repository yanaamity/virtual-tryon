import { useState } from 'react';
import LookCard from './LookCard';
import LookComparison from './LookComparison';

export default function GalleryGrid({ looks, onLooksChange }) {
  const [comparingLooks, setComparingLooks] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleDelete = (id) => {
    onLooksChange(looks.filter(l => l.id !== id));
    setComparingLooks(prev => prev.filter(l => l.id !== id));
  };

  const handleCompare = (look) => {
    setComparingLooks(prev => {
      const exists = prev.find(l => l.id === look.id);
      if (exists) return prev.filter(l => l.id !== look.id);
      if (prev.length >= 4) return prev; // max 4
      return [...prev, look];
    });
  };

  return (
    <div>
      {/* Compare bar */}
      {comparingLooks.length >= 2 && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-purple-800 font-medium">
            {comparingLooks.length} looks selected for comparison
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setComparingLooks([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparison(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {looks.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-700">No saved looks yet</p>
          <p className="text-gray-500 mt-2">Try on some clothes and save your favorite looks!</p>
          <a href="/tryon" className="inline-block mt-6 bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
            Start Try-On
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {looks.map(look => (
            <LookCard
              key={look.id}
              look={look}
              onDelete={handleDelete}
              onCompare={handleCompare}
              isComparing={!!comparingLooks.find(l => l.id === look.id)}
            />
          ))}
        </div>
      )}

      {showComparison && (
        <LookComparison
          looks={comparingLooks}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
