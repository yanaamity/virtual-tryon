import { useState, useEffect } from 'react';
import Head from 'next/head';
import GalleryGrid from '../components/Gallery/GalleryGrid';

export default function GalleryPage() {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/looks')
      .then(r => r.json())
      .then(d => {
        if (d.success) setLooks(d.looks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>Saved Looks – TryOnAI</title>
        <meta name="description" content="View and compare your saved virtual try-on looks" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Looks</h1>
            <p className="text-gray-500 mt-1">
              {looks.length > 0 ? `${looks.length} look${looks.length === 1 ? '' : 's'} saved` : 'Your saved looks will appear here'}
            </p>
          </div>
          <a
            href="/tryon"
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm"
          >
            + New Look
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading your looks...</p>
            </div>
          </div>
        ) : (
          <GalleryGrid looks={looks} onLooksChange={setLooks} />
        )}
      </div>
    </>
  );
}
