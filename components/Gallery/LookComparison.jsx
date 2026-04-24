export default function LookComparison({ looks, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Compare Looks</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">»</button>
        </div>
        <div className={`grid gap-4 ${looks.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          {looks.map(look => (
            <div key={look.id} className="text-center">
              <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3">
                { look.compositeImageUrl && <img src={look.compositeImageUrl} alt={look.productName} className="w-full h-full object-cover" /> }
              </div>
              <p className="font-semibold text-gray-900">{look.productName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
