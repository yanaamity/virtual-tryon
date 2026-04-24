import { useState } from 'react';
const CATEGORIES = ['all', 'tops', 'outerwear', 'dresses', 'pants'];
export default function ProductGrid({ products, selectedProduct, onSelectProduct }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = products.filter(p => { const mc = activeCategory === 'all' || p.category === activeCategory; const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()); return mc && ms; });
  return (
    <div className="flex flex-col h-full">
      <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border rounded-xl mb-3 text-sm" />
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {CATEGORIES.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${activeCategory === cat ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</button>))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => (
            <div key={p.id} onClick={() => onSelectProduct(p)} className={`cursor-pointer rounded-xl overflow-hidden border-2 ${selectedProduct?.id===p.id ? 'border-sky-500"shadow-md':'border-gray-100'}`}>
              <img src={p.imageUrl} alt={p.name} className="w-full aspect-square object-contain p-2" onError={e => { e.target.style.display='none'; }} />
              <div className="p-2"><p className="text-xs font-semibold truncate">{p.name}</p><span className="text-sky-600 font-bold text-sm">{p.price}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
