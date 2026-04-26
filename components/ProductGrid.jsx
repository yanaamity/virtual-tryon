import { useState } from 'react';
import Image from 'next/image';

const CATEGORIES = ['all', 'tops', 'outerwear', 'dresses', 'pants'];

export default function ProductGrid({ products, selectedProduct, onSelectProduct }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-medium">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProduct?.id === product.id}
                onSelect={() => onSelectProduct(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-sky-500 shadow-md shadow-sky-100'
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `
              <div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#e0f2fe,#bfdbfe)">
                <span style="font-size:2.5rem">${getCategoryEmoji(product.category)}</span>
              </div>`;
          }}
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-2.5 bg-white">
        <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sky-600 font-bold text-sm">{product.price}</span>
          <span className="text-gray-400 text-xs">{product.color}</span>
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = { tops: '👕', outerwear: '🧥', dresses: '👗', pants: '👖' };
  return map[category] || '👔';
}
