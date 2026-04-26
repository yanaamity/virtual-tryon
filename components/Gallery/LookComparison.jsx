export default function LookComparison({ looks, onClose }) {
  if (!looks || looks.length < 2) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl p-6 max-w-5xl w-full max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Compare Looks</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`grid gap-4 ${looks.length === 2 ? 'grid-cols-2' : looks.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {looks.map((look, i) => (
            <div key={look.id} className="text-center">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                {look.compositeImageUrl ? (
                  <img
                    src={look.compositeImageUrl}
                    alt={look.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-4xl">👗</span>
                  </div>
                )}
              </div>
              <p className="font-semibold text-sm text-gray-900">{look.productName}</p>
              <p className="text-xs text-gray-500 capitalize mt-0.5">{look.visualizationMode} mode</p>
              {look.positioning && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Scale: {look.positioning.scale?.toFixed(1)}x
                </p>
              )}
              <button
                onClick={() => {
                  if (look.compositeImageUrl?.startsWith('data:')) {
                    const a = document.createElement('a');
                    a.href = look.compositeImageUrl;
                    a.download = `look-${i+1}.png`;
                    a.click();
                  }
                }}
                className="mt-2 text-xs text-sky-500 hover:text-sky-700 underline"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
