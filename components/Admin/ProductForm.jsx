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
  const handleImageChange = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { setForm(f => ({ ...f, imageData: ev.target.result, imagePreview: ev.target.result })); }; reader.readAsDataURL(file); };
  const toggleSize = (size) => { setForm(f => ({ ...f, sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size] })); };
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); setError(''); try { const res = await fetch('isEdit ? `/api/products/${product.id}` : '/api/admin/products', { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: form.name, category: form.category, price: form.price, color: form.color, description: form.description, sizes: form.sizes }) }); const data = await res.json(); if (data.success) { onSaved(data.product || data); } else { setError(data.error || 'Failed'); } } catch (err) { setError(err.message); } finally { setSaving(false); } };
  return (<form></form>);
}
