import { useState } from 'react';

const CATEGORIES = ['tops', 'outerwear', 'dresses', 'pants', 'accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ product, token, onSaved, onCancel }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'tops',
    price: product?.price || '',
    color: product?.color || '',
    description: product?.description || '',
    sizes: product?.sizes || ['S', 'M', 'L'],
    imageData: null,
    imagePreview: product?.imageUrl || null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, imageData: ev.target.result, imagePreview: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const toggleSize = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let url, method, body;
      
      if (isEdit) {
        url = `/api/products/${product.id}`;
        method = 'PUT';
        body = JSON.stringify({
          name: form.name, category: form.category,
          price: form.price, color: form.color,
          description: form.description, sizes: form.sizes,
        });
      } else {
        url = '/api/admin/products';
        method = 'POST';
        body = JSON.stringify({
          name: form.name, category: form.category,
          price: form.price, color: form.color,
          description: form.description, sizes: form.sizes,
          imageData: form.imageData,
        });
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await res.json();
      if (data.success) {
        onSaved(data.product || data);
      } else {
        setError(data.error || 'Failed to save product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
        <div className="flex items-center gap-4">
          {form.imagePreview ? (
            <img src={form.imagePreview} alt="preview" className="w-20 h-20 object-contain rounded-xl bg-gray-100 border" />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl">
              👔
            </div>
          )}
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {isEdit ? 'Change Image' : 'Upload Image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
          <input
            type="text" required value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
            placeholder="Classic Blue T-Shirt"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select
            required value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Price *</label>
          <input
            type="text" required value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
            placeholder="$19.99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Color *</label>
          <input
            type="text" required value={form.color}
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
            placeholder="Blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
          placeholder="Product description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map(size => (
            <button
              key={size} type="button"
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                form.sizes.includes(size)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button" onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={saving}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-semibold transition-colors"
        >
          {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  );
}
